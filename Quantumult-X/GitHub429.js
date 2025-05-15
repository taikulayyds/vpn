#!name=GitHub429
#!desc=解决GitHub速率限制导致更新资源返回429问题
#!icon=https://github.com/taikulayyds/icon/raw/refs/heads/mina/loon.png
#!date=2025-04-29

[Rewrite]
^https:\/\/github\.com\/ header-replace Accept-Language en-us
^https:\/\/(raw|gist)\.githubusercontent\.com\/ header-replace Accept-Language en-us
^https://.*\.githubusercontent\.com\/ url request-header (\r\n)Accept-Language:.+(\r\n) request-header $1Accept-Language: en-us$2

[Mitm]
hostname = raw.githubusercontent.com,gist.githubusercontent.com,github.com,*.githubusercontent.com
