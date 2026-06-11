# 部署运维文档

> 本文档涵盖项目矩阵的完整部署、日常更新、服务器迁移及故障排查指南。
>
> 最后更新：2026年6月

---

## 目录

1. [项目概况](#1-项目概况)
2. [服务器基础信息](#2-服务器基础信息)
3. [网站部署结构](#3-网站部署结构)
4. [完整部署流程（从零开始）](#4-完整部署流程从零开始)
5. [日常更新部署命令](#5-日常更新部署命令)
6. [换电脑注意事项](#6-换电脑注意事项)
7. [服务器到期/更换服务器](#7-服务器到期更换服务器)
8. [常见问题排查](#8-常见问题排查)
9. [重要账号和凭证汇总表](#9-重要账号和凭证汇总表)
10. [Vercel备用部署](#10-vercel备用部署)

---

## 1. 项目概况

| 项目名称 | 项目目录 | 用途 | 部署方式 | 访问地址 |
|---------|---------|------|---------|---------|
| 开发者工具集合站 | `dev-tools-site` | 在线开发者工具（JSON格式化、Base64编解码、时间戳转换等） | 服务器静态部署 | https://huiquicktool.cn |
| 证件照制作工具 | `id-photo-tool` | 在线证件照制作（换底色、裁剪、美颜） | 服务器静态部署 | https://photo.huiquicktool.cn |
| AI智能抠图小程序 | `ai-cutout-miniapp` | 微信小程序——AI一键抠图 | 微信小程序发布 | 微信小程序搜索 |
| 成语答题小游戏 | `idiom-game-miniapp` | 微信小程序——成语答题闯关 | 微信小程序发布 | 微信小程序搜索 |
| AI文案生成助手 | `ai-copywriting-tool` | 微信小程序——AI智能文案生成 | 微信小程序发布 | 微信小程序搜索 |

**说明：**

- 2个Web站点通过服务器静态部署，使用 OpenResty 托管
- 3个小程序通过微信小程序平台发布，不需要服务器部署
- 开发者工具站同时部署到 Vercel 作为备用访问地址

---

## 2. 服务器基础信息

| 项目 | 详情 |
|-----|------|
| 云服务商 | 阿里云（华北2-北京） |
| 服务器IP | `47.95.251.86` |
| 操作系统 | Linux（预装1Panel镜像） |
| 域名 | `huiquicktool.cn`（腾讯云注册，ICP已备案） |
| DNS | 腾讯云 DNSPod |
| 管理面板 | 1Panel v1.10.26 |
| Web服务器 | OpenResty（Docker容器，通过1Panel管理） |
| SSL | Let's Encrypt 免费证书，HTTP验证，自动续签 |

### DNS解析记录

| 主机记录 | 记录类型 | 记录值 | 说明 |
|---------|---------|--------|------|
| `@` | A | `47.95.251.86` | 主站 huiquicktool.cn |
| `www` | A | `47.95.251.86` | www.huiquicktool.cn |
| `photo` | A | `47.95.251.86` | photo.huiquicktool.cn |

### 1Panel面板信息

| 项目 | 详情 |
|-----|------|
| 面板地址 | http://47.95.251.86:8090 |
| 用户名 | `wh5eq6ccmi` |
| 密码 | `ge211ob50q` |

### 需开放的防火墙端口

| 端口 | 用途 |
|------|------|
| 22 | SSH远程连接 |
| 80 | HTTP网站访问 |
| 443 | HTTPS网站访问 |
| 8090 | 1Panel管理面板 |

---

## 3. 网站部署结构

```
服务器 (47.95.251.86)
└── OpenResty (Docker容器)
    ├── huiquicktool.cn → 开发者工具集合站 (dev-tools-site)
    │   └── 网站根目录: /opt/1panel/apps/openresty/openresty/www/sites/huiquicktool.cn/index/
    │
    └── photo.huiquicktool.cn → 证件照制作工具 (id-photo-tool)
        └── 网站根目录: /opt/1panel/apps/openresty/openresty/www/sites/photo.huiquicktool.cn/index/
```

**关键路径说明：**

- OpenResty 网站文件统一存放在 `/opt/1panel/apps/openresty/openresty/www/sites/` 目录下
- 每个站点对应一个以域名命名的子目录
- 站点的实际文件放在 `index/` 子目录中
- 上传部署时需将构建产物上传到对应的 `index/` 目录

---

## 4. 完整部署流程（从零开始）

> 以下是从一台全新服务器开始，完成所有部署的完整步骤。

### 4.1 DNS解析配置

1. 登录 [腾讯云DNSPod控制台](https://console.dnspod.cn/)
2. 添加域名 `huiquicktool.cn`（如果尚未添加）
3. 添加以下A记录：

| 主机记录 | 记录类型 | 线路类型 | 记录值 | TTL |
|---------|---------|---------|--------|-----|
| `@` | A | 默认 | `47.95.251.86` | 600 |
| `www` | A | 默认 | `47.95.251.86` | 600 |
| `photo` | A | 默认 | `47.95.251.86` | 600 |

4. 等待DNS生效（通常几分钟，最长48小时）
5. 验证解析是否生效：

```bash
ping huiquicktool.cn
ping photo.huiquicktool.cn
```

### 4.2 1Panel安装OpenResty

1. 登录1Panel面板：http://47.95.251.86:8090
2. 进入 **应用商店**
3. 搜索 **OpenResty**，点击安装
4. 选择默认配置，确认安装
5. 等待Docker容器拉取并启动完成

> **注意：** 如果是国内服务器，Docker镜像拉取可能超时失败，需要先配置镜像加速器（见[常见问题排查](#8-常见问题排查)中的Docker相关部分）。

### 4.3 创建网站

#### 创建主站 huiquicktool.cn

1. 进入1Panel面板 → **网站** → **创建网站**
2. 选择类型：**静态网站**
3. 主域名填写：`huiquicktool.cn`
4. 别名填写：`www.huiquicktool.cn`
5. 其他保持默认，点击确认创建

#### 创建证件照站 photo.huiquicktool.cn

1. 进入1Panel面板 → **网站** → **创建网站**
2. 选择类型：**静态网站**
3. 主域名填写：`photo.huiquicktool.cn`
4. 其他保持默认，点击确认创建

### 4.4 申请SSL证书

> 优先使用HTTP验证方式，无需配置DNS API密钥，仅需网站正常响应HTTP请求即可完成验证。

#### 主站证书申请

1. 进入1Panel面板 → **网站** → 点击 `huiquicktool.cn` → **HTTPS**
2. 点击 **申请证书**
3. 验证方式选择：**HTTP验证**
4. 域名选择：`huiquicktool.cn` 和 `www.huiquicktool.cn`
5. 提交申请，等待验证完成

#### 证件照站证书申请

1. 进入1Panel面板 → **网站** → 点击 `photo.huiquicktool.cn` → **HTTPS**
2. 点击 **申请证书**
3. 验证方式选择：**HTTP验证**
4. 域名选择：`photo.huiquicktool.cn`
5. 提交申请，等待验证完成

### 4.5 开启HTTPS

1. 进入1Panel面板 → **网站** → 点击站点名称 → **HTTPS**
2. 在证书列表中选择刚申请的证书
3. 点击 **启用**
4. 开启 **HTTP自动跳转HTTPS**（强制跳转）
5. 对两个站点重复以上操作

### 4.6 SSH配置

> 采用双认证配置：公钥认证（用于自动化文件上传）+ 密码认证（保障换设备时的可访问性）。

#### 开启密码认证

1. 登录1Panel面板 → **主机** → **终端**
2. 确认SSH配置允许密码登录：

```bash
# 查看SSH配置
cat /etc/ssh/sshd_config | grep PasswordAuthentication

# 如果显示 no，需修改为 yes
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
systemctl restart sshd
```

#### 添加SSH公钥（本地电脑操作）

1. 在本地电脑生成SSH密钥（如果尚未生成）：

```bash
ssh-keygen -t ed25519
```

2. 查看公钥内容：

```bash
cat ~/.ssh/id_ed25519.pub
```

3. 将公钥添加到服务器（两种方式任选其一）：

**方式一：使用命令添加（推荐）**

```bash
ssh-copy-id root@47.95.251.86
```

**方式二：通过1Panel终端手动添加**

1. 登录1Panel面板 → **主机** → **终端**
2. 执行：

```bash
echo '你的公钥内容' >> ~/.ssh/authorized_keys
```

4. 测试免密登录：

```bash
ssh root@47.95.251.86
```

### 4.7 本地构建项目

#### 构建开发者工具站（主站）

```bash
cd /Users/apple/Desktop/workspace/ai项目/dev-tools-site
npm install
npm run build
```

构建产物在 `dist/` 目录下。

#### 构建证件照站

```bash
cd /Users/apple/Desktop/workspace/ai项目/id-photo-tool
npm install
npm run build
```

构建产物在 `dist/` 目录下。

### 4.8 上传文件到服务器

#### 上传主站文件

```bash
scp -r /Users/apple/Desktop/workspace/ai项目/dev-tools-site/dist/. root@47.95.251.86:/opt/1panel/apps/openresty/openresty/www/sites/huiquicktool.cn/index/
```

#### 上传证件照站文件

```bash
scp -r /Users/apple/Desktop/workspace/ai项目/id-photo-tool/dist/. root@47.95.251.86:/opt/1panel/apps/openresty/openresty/www/sites/photo.huiquicktool.cn/index/
```

上传完成后，访问对应域名验证部署是否成功。

---

## 5. 日常更新部署命令

> 以下是日常开发迭代中更新部署的快捷命令，前提是SSH公钥已配置（可免密登录）。

### 更新主站（开发者工具站）

```bash
# 1. 构建
cd /Users/apple/Desktop/workspace/ai项目/dev-tools-site
npm run build

# 2. 上传
scp -r dist/. root@47.95.251.86:/opt/1panel/apps/openresty/openresty/www/sites/huiquicktool.cn/index/
```

### 更新证件照站

```bash
# 1. 构建
cd /Users/apple/Desktop/workspace/ai项目/id-photo-tool
npm run build

# 2. 上传
scp -r dist/. root@47.95.251.86:/opt/1panel/apps/openresty/openresty/www/sites/photo.huiquicktool.cn/index/
```

### 小程序更新发布

小程序的更新发布流程：

1. 本地构建（如需要）：在项目根目录执行 `npm run build`
2. 使用 **微信开发者工具** 打开项目的 `dist` 目录
3. 点击 **上传** 按钮，填写版本号和备注
4. 登录 [微信公众平台](https://mp.weixin.qq.com/) → **版本管理**
5. 将开发版本提交审核
6. 审核通过后点击 **发布**

---

## 6. 换电脑注意事项

> ⚠️ 这是非常重要的一节！换电脑时务必按以下步骤操作，确保新电脑可以正常部署、旧电脑不再有访问权限。

### 6.1 旧电脑清理操作

#### 删除本地SSH密钥

```bash
rm -rf ~/.ssh/id_ed25519*
```

#### 清除known_hosts中的服务器记录

```bash
ssh-keygen -R 47.95.251.86
```

#### 删除本地项目代码（如果不需要保留）

```bash
rm -rf /Users/apple/Desktop/workspace/ai项目
```

#### 退出所有登录的账号

- [ ] 阿里云控制台
- [ ] 腾讯云控制台
- [ ] 微信公众平台
- [ ] GitHub / Gitee
- [ ] Vercel

### 6.2 服务器端清理旧公钥

#### 方式一：删除指定公钥（推荐）

1. 登录1Panel面板 → **主机** → **终端**
2. 编辑授权密钥文件：

```bash
vi ~/.ssh/authorized_keys
```

3. 找到旧电脑的公钥行（通常在末尾），删除该行
4. 保存退出

#### 方式二：清空所有公钥（需重新配置）

```bash
# 清空所有公钥（后续需重新添加新电脑的公钥）
echo '' > ~/.ssh/authorized_keys
```

### 6.3 新电脑配置

#### 1. 生成新的SSH密钥

```bash
ssh-keygen -t ed25519
```

#### 2. 查看并复制公钥

```bash
cat ~/.ssh/id_ed25519.pub
```

#### 3. 添加公钥到服务器

**方式一：通过1Panel终端添加**

1. 浏览器访问 http://47.95.251.86:8090 登录1Panel面板
2. 进入 **主机** → **终端**
3. 执行：

```bash
echo '粘贴你的新公钥内容' >> ~/.ssh/authorized_keys
```

**方式二：使用ssh-copy-id命令**

```bash
ssh-copy-id root@47.95.251.86
# 需要输入服务器密码
```

#### 4. 测试SSH连接

```bash
ssh root@47.95.251.86
```

如果能免密登录，说明配置成功。

#### 5. 克隆代码仓库

```bash
# 创建工作目录
mkdir -p /Users/apple/Desktop/workspace/ai项目

# 克隆各项目（根据实际仓库地址）
cd /Users/apple/Desktop/workspace/ai项目
git clone <dev-tools-site仓库地址>
git clone <id-photo-tool仓库地址>
git clone <ai-cutout-miniapp仓库地址>
git clone <idiom-game-miniapp仓库地址>
git clone <ai-copywriting-tool仓库地址>
```

#### 6. 安装Node.js环境

```bash
# 推荐使用 nvm 管理 Node.js 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc

# 安装 Node.js LTS 版本
nvm install --lts
nvm use --lts

# 验证
node -v
npm -v
```

#### 7. 安装项目依赖

```bash
cd /Users/apple/Desktop/workspace/ai项目/dev-tools-site && npm install
cd /Users/apple/Desktop/workspace/ai项目/id-photo-tool && npm install
# 其他项目按需安装
```

### 6.4 修改服务器密码（强烈建议）

#### 修改服务器SSH密码

登录1Panel终端执行：

```bash
passwd root
# 输入新密码（输入时不会显示字符，属正常现象）
```

#### 修改1Panel面板密码

```bash
1pctl update password
# 输入新的面板密码
```

---

## 7. 服务器到期/更换服务器

### 7.1 需要备份的内容

| 内容 | 是否必须备份 | 说明 |
|------|------------|------|
| 网站文件 | 不需要 | 可从本地项目重新 `npm run build` 后上传 |
| 1Panel面板配置 | 可选 | 可重新配置，耗时不多 |
| SSL证书 | 不需要 | 可在新服务器重新申请，Let's Encrypt 免费且自动续签 |
| SSH密钥 | 不需要 | 新电脑生成新密钥即可 |
| 代码仓库 | 不需要 | 已备份在 GitHub/Gitee |

### 7.2 新服务器配置流程

#### 第一步：购买新服务器

- 推荐阿里云或腾讯云轻量应用服务器
- 选择1Panel应用镜像（省去手动安装的步骤）
- 推荐2核2G及以上配置

#### 第二步：配置Docker镜像加速（国内服务器必须）

```bash
# 创建或编辑 Docker 配置文件
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
EOF

# 重启 Docker 生效
systemctl daemon-reload
systemctl restart docker
```

#### 第三步：开放防火墙端口

在云服务商控制台的安全组/防火墙中开放以下端口：

| 端口 | 用途 |
|------|------|
| 22 | SSH远程连接 |
| 80 | HTTP网站访问 |
| 443 | HTTPS网站访问 |
| 8090 | 1Panel管理面板 |

#### 第四步：修改DNS解析

1. 登录 [腾讯云DNSPod控制台](https://console.dnspod.cn/)
2. 将3条A记录的记录值从旧IP `47.95.251.86` 修改为新服务器IP
3. 等待DNS生效（TTL 600秒 = 最长10分钟）

#### 第五步：完成部署

按照 [完整部署流程](#4-完整部署流程从零开始) 中的所有步骤执行：

1. 安装OpenResty
2. 创建网站
3. 申请SSL证书
4. 开启HTTPS
5. 配置SSH
6. 构建并上传网站文件

### 7.3 域名续费提醒

- ⏰ **域名到期前30天**需要进行续费
- 登录腾讯云控制台 → 域名管理 → 续费
- 建议开启自动续费

### 7.4 ICP备案变更

- 如果更换了不同云服务商（如从阿里云换到腾讯云），需要做ICP备案接入变更
- 如果仍在同一服务商（只是换了服务器），通常只需更新备案中的IP信息
- 备案变更期间网站可能需要暂时关闭，建议提前办理

---

## 8. 常见问题排查

### SSH连接失败

**现象：** `ssh root@47.95.251.86` 连接超时或拒绝

**排查步骤：**

1. 检查服务器是否运行：`ping 47.95.251.86`
2. 检查防火墙端口22是否开放（云服务商安全组 + 服务器防火墙）
3. 检查密码/公钥是否正确
4. 尝试通过1Panel面板的终端功能登录（Web终端不依赖SSH）
5. 检查SSH服务是否运行：

```bash
systemctl status sshd
```

### 网站无法访问

**现象：** 浏览器访问域名无法打开页面

**排查步骤：**

1. **检查DNS解析：**

```bash
nslookup huiquicktool.cn
# 确认解析到 47.95.251.86
```

2. **检查OpenResty是否启动：**
   - 登录1Panel → **容器** → 查看OpenResty容器是否正常运行
   - 或在终端执行：`docker ps | grep openresty`

3. **检查防火墙：** 确认80和443端口已开放

4. **检查网站文件：** 确认 `index/` 目录下有文件

5. **查看OpenResty日志：**
   - 1Panel → **网站** → 点击站点 → **日志**

### SSL证书过期

**现象：** 浏览器提示"您的连接不是私密连接"或证书过期

**解决步骤：**

1. 登录1Panel面板 → **网站** → 点击站点 → **HTTPS**
2. 查看证书状态和到期时间
3. 如果证书即将过期或已过期，点击 **申请证书** 手动续期
4. Let's Encrypt证书有效期为90天，正常情况下1Panel会自动续签
5. 如果自动续签失败，检查HTTP验证是否正常（80端口是否可访问）

### Docker镜像拉取失败

**现象：** 安装OpenResty等应用时，Docker pull超时

**解决步骤：**

1. 编辑Docker配置文件：

```bash
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
EOF
```

2. 重启Docker服务：

```bash
systemctl daemon-reload
systemctl restart docker
```

3. 重试安装应用

### 1Panel面板打不开

**现象：** http://47.95.251.86:8090 无法访问

**排查步骤：**

1. 检查防火墙8090端口是否开放
2. 通过SSH登录检查1Panel服务状态：

```bash
systemctl status 1panel
```

3. 如果服务未运行，启动服务：

```bash
systemctl start 1panel
```

4. 如果忘记面板密码，通过SSH重置：

```bash
1pctl update password
```

### scp上传失败

**现象：** `scp` 命令上传文件时权限拒绝或连接失败

**排查步骤：**

1. 确认SSH可以正常连接：`ssh root@47.95.251.86`
2. 确认目标目录路径正确
3. 检查服务器磁盘空间是否充足：

```bash
df -h
```

4. 如果权限不足，检查目录权限：

```bash
ls -la /opt/1panel/apps/openresty/openresty/www/sites/huiquicktool.cn/
```

---

## 9. 重要账号和凭证汇总表

| 平台 | 用途 | 账号/用户名 | 密码 | 备注 |
|------|------|------------|------|------|
| 阿里云 | 服务器管理 | — | — | 请自行补充 |
| 腾讯云 | 域名管理、DNS解析 | — | — | 请自行补充 |
| 1Panel面板 | 服务器管理面板 | `wh5eq6ccmi` | `ge211ob50q` | http://47.95.251.86:8090 |
| 服务器SSH | 远程连接 | `root` | — | 请自行补充 |
| 微信公众平台 | 小程序发布管理 | — | — | https://mp.weixin.qq.com |
| GitHub | 代码备份 | — | — | 请自行补充 |
| Gitee | 代码备份（国内） | — | — | 请自行补充 |
| Vercel | 开发者工具站备用部署 | — | — | 请自行补充 |

> ⚠️ **安全提示：** 上表中标记"请自行补充"的密码请务必妥善保管，不要以明文形式存储在易泄露的位置。建议使用密码管理器（如1Password、Bitwarden等）管理所有密码。

---

## 10. Vercel备用部署

开发者工具站（dev-tools-site）同时部署到 Vercel 作为备用访问地址：

- **备用地址：** https://dev-tools-site-mu.vercel.app
- **无需服务器**，Vercel自动从代码仓库构建部署
- 当主站 `huiquicktool.cn` 服务器不可用时，可通过此地址访问

### Vercel更新方式

Vercel默认配置了自动部署，当 `dev-tools-site` 仓库的主分支有新代码推送时，Vercel会自动触发重新构建和部署。

如果需要手动触发：

1. 登录 [Vercel控制台](https://vercel.com/)
2. 进入 `dev-tools-site` 项目
3. 点击 **Deployments** → **Redeploy**

---

## 附录：快速参考卡片

### 一键部署主站

```bash
cd /Users/apple/Desktop/workspace/ai项目/dev-tools-site && npm run build && scp -r dist/. root@47.95.251.86:/opt/1panel/apps/openresty/openresty/www/sites/huiquicktool.cn/index/
```

### 一键部署证件照站

```bash
cd /Users/apple/Desktop/workspace/ai项目/id-photo-tool && npm run build && scp -r dist/. root@47.95.251.86:/opt/1panel/apps/openresty/openresty/www/sites/photo.huiquicktool.cn/index/
```

### SSH快速连接

```bash
ssh root@47.95.251.86
```

### 1Panel面板

```
http://47.95.251.86:8090
用户: wh5eq6ccmi
密码: ge211ob50q
```
