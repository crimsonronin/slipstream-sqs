# SQS Queue Provider for Slipstream

![Slipstream: X-Men](https://s3-ap-southeast-2.amazonaws.com/pixy-marketing/github/slipstream.jpg)

This is a SQS queue provider for [Slipstream](https://github.com/crimsonronin/slipstream).

### Install

```
npm install slipstream-sqs --save
```

Although it can be used on it's own (it is effectively just a wrapper around [aws-sdk-js](https://github.com/aws/aws-sdk-js)), it is intended to be used in conjunction with [Slipstream](https://github.com/crimsonronin/slipstream).

### Example

```javascript
var Queue = require('slipstream');
var Sqs = require('slipstream-sqs');

var provider = new Sqs({
       region: 'us-west-1',
       accessKeyId: 'your access id',
       secretAccessKey: 'your access key',
       queueUrl: 'sqs queue url'
    });

var queue = new Queue({
        provider: provider
    });

queue.on(queue.EVENTS.MESSAGE_RECEIVED, function(message, done) {
    //do some processing on a message
    var data = message.data;
    
    done();
});

queue.process();
```

For more information on how queues are processed, see the docs on the [Slipstream](https://github.com/crimsonronin/slipstream) github.

### Tests

```
npm test
```