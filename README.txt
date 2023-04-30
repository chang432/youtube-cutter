Stuff to install: 
- awscli 
- terraform 
- nvm (node version manager) 


Backend cmds:
build everything - "bash deploy.sh"
install node - "nvm install" at root dir
install node packages - "npm install typescript aws-sdk @types/aws-lambda @types/node --target_arch=x64 --target_platform=linux --target_libc=glibc --save"
convert ts to js - "./node_modules/.bin/tsc --build tsconfig.json" at backend dir