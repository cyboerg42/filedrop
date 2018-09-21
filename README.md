# filedrop
a simple file sharing site with duplicate file detection using mongodb and xxhash


dependencies : mongodb, nodejs


temporary install : 

```
git clone https://github.com/cyborg00222/filedrop
cd filedrop
npm install
node app.js
```

install as a service :

```
cd /srv/
git clone https://github.com/cyborg00222/filedrop
useradd -d /srv/filedrop -G nodejs nodejs
chown -R nodejs:nodejs /srv/filedrop
```
create service file at /etc/systemd/system/filedrop.service


```
[Unit]
Description=filedrop
Requires=After=mongod.service

[Service]
User=nodejs
Group=nodejs
ExecStart=/usr/bin/node /srv/filedrop/app.js
WorkingDirectory=/srv/filedrop/
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nodejs-filedrop

[Install]
WantedBy=multi-user.target
```

```
systemctl daemon-reload
systemctl enable filedrop && systemctl start filedrop
```
