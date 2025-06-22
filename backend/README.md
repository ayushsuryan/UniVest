To set up CI/CD between your Node.js backend on GitLab and a remote NVMe Ubuntu 22.04 server, follow these structured steps:

✅ Overview
Source Code: GitLab repository.

CI/CD Tool: GitLab CI/CD (.gitlab-ci.yml)

Deployment Server: Your NVMe Ubuntu 22.04 server (e.g., IP: 157.180.90.43)

Access Method: SSH (using SSH key authentication)

Web Process Manager: PM2 (to run Node.js app)

🔧 Step-by-Step CI/CD Setup

1. Install Required Packages on Server
   SSH into your server:

bash
Copy
Edit
ssh root@157.180.90.43
Install dependencies:

bash
Copy
Edit
sudo apt update
sudo apt install -y nodejs npm git build-essential pm2 openssh-server
Make sure Node is installed:

bash
Copy
Edit
node -v
npm -v
Install PM2:

bash
Copy
Edit
sudo npm install -g pm2 2. Create SSH Key for GitLab Runner
On your local machine or CI runner:

bash
Copy
Edit
ssh-keygen -t ed25519 -C "gitlab-deploy" -f ~/.ssh/gitlab_deploy_key
This generates:

Private key: ~/.ssh/gitlab_deploy_key

Public key: ~/.ssh/gitlab_deploy_key.pub

3. Add Public Key to Your Server
   Copy the public key to the server:

bash
Copy
Edit
ssh-copy-id -i ~/.ssh/gitlab_deploy_key.pub root@157.180.90.43
Or manually append it:

bash
Copy
Edit
cat ~/.ssh/gitlab_deploy_key.pub | ssh root@157.180.90.43 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
Test it:

bash
Copy
Edit
ssh -i ~/.ssh/gitlab_deploy_key root@157.180.90.43 4. Add Keys to GitLab CI/CD Variables
Go to GitLab Project → Settings → CI/CD → Variables.

Add:

SSH_PRIVATE_KEY
Paste content of ~/.ssh/gitlab_deploy_key (entire file, including -----BEGIN... and -----END...)

✅ Mark as “Protected” if you're only deploying from main.

SSH_KNOWN_HOSTS
Run this:

bash
Copy
Edit
ssh-keyscan -H 157.180.90.43
Copy the output and paste here.

5. Create .gitlab-ci.yml in Your Project Root
   yaml
   Copy
   Edit
   stages:

- build
- deploy

variables:
NODE_ENV: production
DEPLOY_HOST: "157.180.90.43"
DEPLOY_USER: "root"
DEPLOY_PATH: "/var/www/finance-backend"
APP_NAME: "finance-backend"

before_script:

- which ssh-agent || (apt-get update -y && apt-get install openssh-client -y)
- eval $(ssh-agent -s)
- echo "$SSH_PRIVATE_KEY" > ~/.ssh/deploy_key
- chmod 600 ~/.ssh/deploy_key
- ssh-add ~/.ssh/deploy_key
- mkdir -p ~/.ssh
- echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
- chmod 644 ~/.ssh/known_hosts

build:
stage: build
image: node:18
script: - npm ci --production

deploy:
stage: deploy
image: node:18
before_script: - apt-get update && apt-get install -y rsync - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" > ~/.ssh/deploy_key - chmod 600 ~/.ssh/deploy_key - ssh-add ~/.ssh/deploy_key - mkdir -p ~/.ssh - echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
  script:
    - echo "Deploying to server..."
    - rsync -avz --delete --exclude=node_modules --exclude=.git ./ $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/
    - ssh $DEPLOY_USER@$DEPLOY_HOST "cd $DEPLOY_PATH && npm install --production && pm2 restart $APP_NAME || pm2 start server.js --name $APP_NAME"
only: - main
📦 Folder Structure on Server
On your NVMe server, after deployment, your folder will look like:

go
Copy
Edit
/var/www/finance-backend/
├── node_modules/
├── server.js
├── package.json
├── ...
🔁 Auto-Restart on Reboot (Optional)
On the server:

bash
Copy
Edit
pm2 startup
pm2 save
✅ Final Checklist
Item Status
SSH Key added to server ✅
GitLab CI/CD private key variable ✅
pm2 installed and used ✅
.gitlab-ci.yml configured ✅
Node.js server accessible over SSH ✅

Let me know if you'd like me to generate a working .gitlab-ci.yml based on your project files (server.js, ecosystem.config.js, etc.).
