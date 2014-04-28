ec2sync
=======
[![Dependencies Status](https://david-dm.org/aviramst/ec2sync.png)](https://david-dm.org/aviramst/ec2sync)

Sync EC2 hostnames to your local hosts file.

Supports Linux, OS X & Windows.

#Installation:
```
npm install -g ec2sync
```

#Usage:

Add the following rows to your hosts file:
```
# ec2sync-section-start #
# ec2sync-section-end #
```

This module uses [RC](https://www.npmjs.org/package/rc) to manage its configuration,
you will have to type your AWS credentials into .ec2syncrc file and put it in your home directory.

Use the [```example```](example/.ec2syncrc) file.

In Linux & OS X, Run:

```
sudo ec2sync
```

In Windows, Run as Administrator:

```
ec2sync
```
