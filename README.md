ec2sync
=======
[![Dependencies Status](https://david-dm.org/aviramst/ec2sync.png)](https://david-dm.org/aviramst/ec2sync)

Sync EC2 hostnames to your local hosts file.

Currently supports only Linux & OS X.

#Installation:
```
npm install -g ec2sync
```

#Usage:

Add the following rows to your hosts file (/etc/hosts):
```
  # ec2sync-section-start #
  # ec2sync-section-end #
```

This module uses [RC](https://www.npmjs.org/package/rc) to manage its configuration, so you will have to type your AWS credentials into the [```.ec2syncrc```](.ec2syncrc) file.

Run:

```
sudo ec2sync
```
