# Seascape
Front-end (WEBMAIL) for [Galleon](https://github.com/schahriar/galleon) *Beta 2* Mail Server.

## What's new
- XSS Protection using Anti Module
- Responsive design
- Attachment & Multi-upload support
- Auto-discovery

## Installation
Follow the [directions to install Galleon](https://github.com/schahriar/Galleon/blob/master/tutorials/INSTALLATION.md) and after running **galleon setup** you'll be able to install Seascape using:
```
galleon install seascape
```
This will automatically install and launch after a server restart:
```
galleon restart
```

## Serving static
You can proxy Galleon API (serving on port 3080 by default) and serve Seascape **dist** folder as static front-end. This can be done using **NGINX**:
```
upstream Galleon {
    server 127.0.0.1:3080;
    keepalive 8;
}

server {
        listen 80;
        listen [::]:80;

        # Make site accessible from your-domain.com
        server_name <your-domain>;

        root <path-to-static-folder>;

        location / {
                try_files $uri $uri/ $uri.html =404;
        }

        location /api {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $http_host;
                proxy_set_header X-NginX-Proxy true;

                proxy_pass http://Galleon/;
                proxy_redirect off;
        }
}
```

## Access
A FQDN (Fully Qualified Domain Name) is required for access. You'll need to set this up through **galleon setup** which will provide access to your webmail interface through <your-domain.com>:2095

## Screenshots
![Screenshots](https://raw.githubusercontent.com/schahriar/Seascape/master/display/email-list.jpg)
![Screenshots](https://raw.githubusercontent.com/schahriar/Seascape/master/display/email-show.jpg)
![Screenshots](https://raw.githubusercontent.com/schahriar/Seascape/master/display/zero-data.jpg)

## NOTICE
**SEASCAPE & GALLEON** are both in beta stages and may/will have critical bugs. These bugs will be fixed as we get closer to a release version. You can [report any issues with this repository here](https://github.com/schahriar/Seascape/issues/new).
