#!name=github429
#!desc=解决github更新资源429问题
#!openUrl=https://axs66.github.io/repo
#!author=A先生[https://qq.ios999.vip/axs/Axs.jpg]
#!homepage=https://axs66.github.io/repo
#!icon=http://q4.qlogo.cn/headimg_dl?dst_uin=1317208960&spec=640
#!date=2025-04-29

[Rewrite]
^https:\/\/(raw|gist)\.githubusercontent\.com\/ header-replace Accept-Language en-us
^https:\/\/github\.com\/ header-replace Accept-Language en-us

[Mitm]
hostname = raw.githubusercontent.com,gist.githubusercontent.com,github.com
