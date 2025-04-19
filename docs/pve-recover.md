---
title: PVE的备份恢复测试
date: "2025-04-21"
cover: https://upyun.afunny.top/2025/03/22/67de8c4a2713c.jpeg
categories: jdi
---
## 背景
我的Home Server是搭建在联想G510笔记本上的PVE系统，基于这个虚拟化平台，我启动了一些服务，如[我的密码管理工具 | 自建 bitwarden](/bitwarden){target="_blank" rel="tag help"}。为了保证PVE系统的稳定运行，我希望通过笔记本自带的电池充当ups，给整个PVE系统保证安全的关机时间。但是在网上并没有太多相关教程， 于是研究了下，总结下面的文档。
![微信图片_20250419193331.jpg](https://upyun.afunny.top/2025/04/19/68038a244bb4e.jpg)

## 流程梳理
- 通过 ACPI 模块获取，当前是否断电和电池的剩余电量
- 通过 PVE 的命令，操作关闭虚拟机，关闭PVE

以下的命令都是在pve的命令行执行。
## 电源管理模块 ACPI
ACPI全称AdvancedConfigurationPowerInterface（高级配置电源界面）。它是1997年由Intel、Microsoft、Toshiba，HP，Phoenix所共同制定，提供操作系统应用程序管理所有电源管理的接口。2000年8月推出 ACPI 2.0规范。2004年9月推出 ACPI 3.0规范。2009年6月16日则推出ACPI 4.0规范。最新ACPI版本为5.0，2011年发布。电源管理是ACPI中非常重要的一部分。

执行以下命令查看ACPI是否已经安装
```
ps -ef | grep -w “acpid” | grep -v “grep”
```
如果没有进程正在运行，则表示ACPI尚未安装。请继续下一步。
如果有进程正在运行，则表示 ACPI 已安装。

### 执行以下命令安装 ACPI
```shell
apt-get install acpi
```

### ACPI 相关命令

```shell
root@dev:~# acpi --help
Usage: acpi [OPTION]...
Shows information from the /proc filesystem, such as battery status or
thermal information.
  // 省略部分...
  -b, --battery            battery information
  -i, --details            show additional details if available:
                             - battery capacity information
                             - temperature trip points
  -a, --ac-adapter         ac adapter information
  // 省略部分...
```
命令执行输出
```bash
// 查看当前是电源供电还是电池供电
acpi -a
// Adapter 0: on-line 电源供电； off-line 电池供电

// 查看当前电池电量
acpi -b 
// Battery 0: Full, 100%

acpi -b -i
// Battery 0: Full, 100%
// Battery 0: design capacity 3244 mAh, last full capacity 2546 mAh = 78%
```
加上`-i`参数可以查看电池的详细信息，我的笔记本总容量3244 mAh，实际充满2546 mAh，电池健康度78%。这个十多年的笔记本电池容量还有78%的，实在让人惊喜。
![IMG_3111_preview.jpeg](https://upyun.afunny.top/2025/04/19/68037a58516a7.jpeg)
笔记本电池，预估可以支撑3个多小时。实测了下电量百分比是线性往下掉的，所以通过监控剩余电量是可靠的。

通过上面的分析，可以获取当前是否断电，以及电池剩余的电量。有这两个信息，就可以做一些策略关机了。

## pve的一些命令


### qm 常用命令, 更详细的命令执行 `qm help`
```bash
root@dev:~# qm 
USAGE: qm <COMMAND> [ARGS] [OPTIONS]
       // 省略部分...
       qm list  [OPTIONS]
       qm stop `<vmid>` [OPTIONS]
       // 省略部分...

```

### qm list 获取创建的虚拟机列表

```bash
root@dev:~# qm list
      VMID NAME                 STATUS     MEM(MB)    BOOTDISK(GB) PID       
       103 fnos                 running    4096              32.00 1069      
       104 centosDev2           running    8192              32.00 1147
```

### qm stop `<vmid>` 根据 vmid 关闭虚拟机
可以通过增加 --timeout=x 来等待系统进程关闭。

```bash

root@dev:~# qm help stop 
USAGE: qm stop `<vmid>` [OPTIONS]
  Stop virtual machine. The qemu process will exit immediately. Thisis akin
  to pulling the power plug of a running computer and may damage the VM
  data

  `<vmid>`     <integer> (100 - 999999999)
             The (unique) ID of the VM.
  // 省略部分...
  -timeout   <integer> (0 - N)
             Wait maximal timeout seconds.
```
例如: 执行 qm stop 100 --timeout 60  
├─ PVE 发送 ACPI 关机信号 → 虚拟机开始关闭进程  
├─ 若 60 秒内完成 → 正常关机（状态变为 stopped）  
└─ 若超时 → 强制断电（生成日志事件 "guest shutdown timed out"）
## 新建脚本 ups_monitor.sh
可以放在当前用户的根目录，然后添加可执行权限。同时通过crontab，设置机器重启后执行脚本。
```
chmod +x /root/ups_monitor.sh

sudo crontab -e
// 添加下面一行，系统启动时运行脚本
@reboot  /root/ups_monitor.sh
```
## ups_monitor.sh 完整脚本

```bash
#!/bin/bash

# 配置参数（可根据需要调整）
THRESHOLD=30                # 触发关机的电量百分比阈值
NOTIFY_URL="https://api.day.app/your_bark_token"  # 自定义通知接口地址
SLEEP_INTERVAL=30           # 检测间隔时间（秒）
NOTIFY_WHEN_OFFLINE=false    # 断电状态标记（初始为市电连接）

# PVE关闭所有虚拟机和容器的函数
safe_shutdown_pve() {
  # 停止所有运行中的KVM虚拟机（ID>=100）
  for vm in $(qm list | awk '/running/{print $1}'); do
    qm stop "$vm" --timeout 60  # 超时60秒强制停止
  done

  # 停止所有运行中的LXC容器（ID<100）
  for ct in $(pct list | awk '/running/{print $1}'); do
    pct shutdown "$ct" --timeout 60
  done

  # 等待所有资源释放（可选）
  sleep 10
}

while true; do
  # 检测是否使用电池供电（AC电源断开）
  if acpi -a | grep -q "off-line"; then
    # 提取当前电量百分比（兼容多电池情况，取最小值）
    battery_level=$(
      acpi -b | grep -Po '\d+%' | cut -d% -f1 | \
      sort -n | head -n1  # 若有多个电池，取电量最低的
    )

    # 检查到断电触发一次通知
    if ! $NOTIFY_WHEN_OFFLINE; then
      NOTIFY_WHEN_OFFLINE=true
      curl -X POST "$NOTIFY_URL" -H "Content-Type: application/json" -d "{  \"title\": \"断电了，当前电量${battery_level}%\"}" --connect-timeout 10
    fi

    # 判断电量是否低于阈值
    if [ "$battery_level" -le "$THRESHOLD" ]; then
      # 发送HTTP通知（可自定义JSON格式或参数）
      curl -X POST "$NOTIFY_URL" -H "Content-Type: application/json" -d "{  \"title\": \"断电了，当前电量${battery_level}%，触发安全关机\"}" --connect-timeout 10

      # 安全关闭PVE虚拟机和容器
      safe_shutdown_pve
      shutdown -h now
      exit
    fi
  fi
  sleep "$SLEEP_INTERVAL"
done
```
家里如果断电了，路由器估计也关掉了，消息通知的功能应该没用了~ 其他关机功能还会照常执行。