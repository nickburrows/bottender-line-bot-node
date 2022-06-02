const { getClient } = require('bottender');
const fileType = require('file-type');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { resolve } = require('path');
const client = getClient('line');
const got = require('got');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

Sentry.init({
  dsn: 'https://1ea30777d9024571bd961c6263cbd51a@o1182010.ingest.sentry.io/6297947',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
  op: 'test',
  name: 'My First Test Transaction',
});

const quickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'cameraRoll',
        label: 'Send photo',
      },
    },
    {
      type: 'action',
      action: {
        type: 'camera',
        label: 'Open camera',
      },
    },
  ],
};

const selectOptions = [
  { name: '小貓', value: 'SHUCHI', catalog: 'A', group: 'A' },
  { name: '克勞', value: 'KULAU', catalog: 'A', group: 'A' },
  { name: '虎爺', value: 'LIN_HU', catalog: 'A', group: 'A' },
  { name: '蓋伊', value: 'GYEE', catalog: 'A', group: 'A' },
  { name: '東放', value: 'SUM', catalog: 'A', group: 'B' },
  { name: '竹本', value: 'TAKE', catalog: 'A', group: 'B' },
  { name: '寶可夢', value: 'POKEMON', catalog: 'A', group: 'B' },
  { name: '騎士學院', value: 'KC', catalog: 'A', group: 'B' },
  { name: 'BEEK', value: 'BEEK', catalog: 'A', group: 'C' },
  { name: 'SDO', value: 'SDO', catalog: 'A', group: 'C' },
  { name: '獸太', value: 'FURRY_SHOTA', catalog: 'A', group: 'C' },
  { name: '獸設', value: 'FURRY', catalog: 'A', group: 'C' },
  { name: '和服', value: 'KIMONO', catalog: 'B', group: 'D' },
  { name: '潟湖秘密', value: 'LAGOON', catalog: 'B', group: 'D' },
  { name: 'Kevin', value: 'KEVIN', catalog: 'B', group: 'D' },
  { name: '全部', value: 'ALL', catalog: 'C', group: 'D' },
];

const buttonImages = [
  'https://dev.tznick.com/images/beek/beek_6.jpg',
  'https://dev.tznick.com/images/beek/beek_4.jpg',
  'https://dev.tznick.com/images/beek/beek_7.jpg',
  'https://dev.tznick.com/images/beek/beek_2.jpg',
];

const questionMarkImage = [
  'https://imgur.com/tCE0fBo.jpg',
  'https://imgur.com/IJJdFLg.jpg',
  'https://imgur.com/9OfKeKt.jpg',
  'https://imgur.com/YttKa0f.jpg',
  'https://imgur.com/l3kqxrV.jpg',
  'https://imgur.com/ivi8YuQ.jpg',
  'https://imgur.com/zzvVCLV.jpg',
  'https://imgur.com/2a9WSxO.jpg',
  'https://imgur.com/5otfnLy.jpg',
  'https://imgur.com/Ez7RIUb.jpg',
  'https://imgur.com/elzI4tA.jpg',
];

// const messageTemplate = [
//   { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
//   { label: 'Say hello1', type: 'postback', data: 'hello 1' },
//   { label: '言 hello2', type: 'postback', data: 'hello 2', text: 'hello 2' },
//   { label: 'Say message', type: 'message', text: 'Rice=米' },
// ];

const replyText = (context, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return context.reply(texts.map((text) => ({ type: 'text', text })));
};

const replyMessage = (context, messages) => {
  messages = Array.isArray(messages) ? messages : [messages];
  return context.reply(messages.map((message) => message));
};

const randomArr = (Arr) => {
  Arr = Array.isArray(Arr) ? Arr : [Arr];
  return Arr[Math.floor(Math.random() * Arr.length)];
};

function randomImage(context, imgs) {
  imgs = Array.isArray(imgs) ? imgs : [imgs];

  return context.reply(
    imgs.map((image) => ({
      type: 'image',
      originalContentUrl: image,
      previewImageUrl: image,
    }))
  );
}

const carouseTelmplate = () => {
  const buttonsImageURL =
    buttonImages[Math.floor(Math.random() * buttonImages.length)];
  const carouselImageURL = randomArr(buttonImages);
  return {
    type: 'template',
    altText: 'Carousel alt text',
    template: {
      type: 'carousel',
      columns: [
        {
          thumbnailImageUrl: buttonsImageURL,
          title: 'hoge',
          text: 'fuga',
          actions: [
            { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
            { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
          ],
        },
        {
          thumbnailImageUrl: carouselImageURL,
          title: 'hoge',
          text: 'fuga',
          actions: [
            {
              label: '言 hello2',
              type: 'postback',
              data: 'hello こんにちは',
              text: 'hello こんにちは',
            },
            { label: 'Say message', type: 'message', text: 'Rice=米' },
          ],
        },
      ],
    },
  };
};

async function HandleMessage(context, props) {
  if (process.env.NODE_ENV === 'development') {
    Sentry.captureException(props.error);
    setTimeout(() => {
      try {
        context.sendText(props.error.stack);
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        transaction.finish();
      }
    }, 99);
  }

  const message = await context.event;
  const source = await message.source;
  const count = context.state.count + 1;
  const questionMarkImageUrl = randomArr(questionMarkImage);
  if (message.isText) {
    context.setState({
      count,
    });
    const userMessage = message.text;
    // const profileRegex = /^profile$/;
    // const buttonsRegex = /^buttons$/;
    const questionRegex = /\.+(?:(\?+|？+))|(?:(\?+|？+))\.+|(\?+|？+)/;
    const regex1 = /1/;
    // const regex2 = /2/;
    // const confirmRegex = /^confirm$/;
    const quickreplyRegex = /^quickreply$/;
    const carouselRegex = /^carousel$/;
    const templateRegex = /^template$/;
    // const imagecarouselRegex = /^image\scarousel$/;
    // const datetimeRegex = /^datetime$/;
    // const imagemapRegex = /^imagemap$/;
    // const byeRegex = /^bye$/;

    switch (true) {
      case quickreplyRegex.test(userMessage):
        return await context.reply([
          {
            type: 'text',
            text: 'hello',
            quickReply,
          },
        ]);
      case questionRegex.test(userMessage):
        return await randomImage(context, questionMarkImageUrl);
      case carouselRegex.test(userMessage):
        return await replyMessage(context, carouseTelmplate());
      case templateRegex.test(userMessage):
        return await replyMessage(context, setMenuGroup());
      case regex1.test(userMessage):
        return await replyText(context, `對`);
      default:
        console.log(`user id: ${source.userId},\n` + `Count: ${count}`);
        return await replyText(
          context,
          `received the text message: ${userMessage}`
        );
    }
    // if (text === 'carousel') {
    //   await replyMessage(context, carouselTemplate());
    // } else if (text === 'echo') {
    //   await replyText(context, text);
    // } else if (text === 'template') {
    //   await replyMessage(context, setMenuGroup());
    // } else if (text === '1') {
    //   await context.sendText(`對`);
    // } else if (text === 'db') {
    //   await replyMessage(context, getClient());
    // } else {
    //   await context.sendText(`received the text message: ${text}`);
    // }
    // } else if (message.isImage) {
    //   return await HandleMessage(context, message);
    // }
  } else if (context.event.isImage) {
    const downloadPath = path.join(
      __dirname,
      'downloaded',
      `${message.image.id}.jpg`
    );
    return await downloadContent(context, downloadPath);
  }
}

function handleImage(context, message) {
  const img = message.image;
  let getContent;
  if (context.platform === 'line') {
    // `context.client` is a `LineClient` instance
    const downloadPath = path.join(__dirname, 'downloaded', `${img.id}.jpg`);
    const previewPath = path.join(
      __dirname,
      'downloaded',
      `${img.id}-preview.jpg`
    );
    getContent = downloadContent(img.id, downloadPath).then((downloadPath) => {
      cp.execSync(
        `convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`
      );
      return {
        originalContentUrl:
          baseURL + '/downloaded/' + path.basename(downloadPath),
        previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
      };
    });
  } else if (context.platform === 'external') {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent.then(({ originalContentUrl, previewImageUrl }) => {
    return context.reply({
      type: 'image',
      originalContentUrl,
      previewImageUrl,
    });
  });
}

function downloadContent(context, downloadPath) {
  return context.getMessageContent(context.event.image.id).then(
    (stream) =>
      new Promise((resolve, reject) => {
        const writable = fs.createWriteStream(downloadPath);
        stream.pipe(writable);
        stream.on('end', () => resolve(downloadPath));
        stream.on('error', reject);
      })
  );
}

function carouselTemplate() {
  const postbackImageURL1 = `https://dev.tznick.com/images/lagoon/lagoon_4.jpg`;
  const textImageURL = `https://dev.tznick.com/images/lagoon/lagoon_2.jpg`;
  const uriImageURL = `https://dev.tznick.com/images/lagoon/lagoon_1.jpg`;
  const calenderImageURL = `https://dev.tznick.com/images/lagoon/lagoon_6.jpg`;
  // const uriMessage = messageTemplate.find((msg) => msg.type === 'uri');
  // const postbackMessage = messageTemplate.find(
  //   (msg) => msg.type === 'postback'
  // );
  // const textkMessage1 = messageTemplate.find((msg) => msg.type === 'message');
  // const objIndex = messageTemplate.findIndex((msg) => msg.type === 'postback');
  // const postbackMessage2 = messageTemplate[objIndex + 1];

  return {
    type: 'template',
    altText: 'Image carousel alt text',
    template: {
      type: 'image_carousel',
      columns: [
        {
          imageUrl: uriImageURL,
          action: {
            label: 'Go to LINE',
            type: 'uri',
            uri: 'https://line.me',
          },
        },
        {
          imageUrl: postbackImageURL1,
          action: {
            label: 'Say hello1',
            type: 'postback',
            data: 'hello 1',
          },
        },
        {
          imageUrl: textImageURL,
          action: {
            label: 'Say message',
            type: 'message',
            text: 'Rice=米',
          },
        },
        {
          imageUrl: calenderImageURL,
          action: {
            label: 'datetime',
            type: 'datetimepicker',
            data: 'DATETIME',
            mode: 'datetime',
          },
        },
      ],
    },
  };
}

function setMenuGroup() {
  var menuGroupA = selectOptions.filter((arr) => arr.group === 'A');
  var menuGroupB = selectOptions.filter((arr) => arr.group === 'B');
  var menuGroupC = selectOptions.filter((arr) => arr.group === 'D');
  var menuGroupD = selectOptions.filter((arr) => arr.group === 'D');

  var menuGroupA_img = 'https://dev.tznick.com/images/beek/beek_6.jpg';
  var menuGroupB_img = 'https://dev.tznick.com/images/beek/beek_1.jpg';
  var menuGroupC_img = 'https://dev.tznick.com/images/beek/beek_7.jpg';
  var menuGroupD_img = 'https://dev.tznick.com/images/beek/beek_2.jpg';

  var messageButtonA = menuGroupA.map(function (item) {
    return {
      type: 'button',
      action: {
        type: 'message',
        label: item.name,
        text: item.value,
      },
    };
  });

  var messageButtonB = menuGroupB.map(function (item) {
    return {
      type: 'button',
      action: {
        type: 'message',
        label: item.name,
        text: item.value,
      },
    };
  });

  var messageButtonC = menuGroupC.map(function (item) {
    return {
      type: 'button',
      action: {
        type: 'message',
        label: item.name,
        text: item.value,
      },
    };
  });

  var messageButtonD = menuGroupD.map(function (item) {
    return {
      type: 'button',
      action: {
        type: 'message',
        label: item.name,
        text: item.value,
      },
    };
  });

  const flex1 = {
    type: 'bubble',
    size: 'mega',
    hero: {
      type: 'image',
      url: menuGroupA_img,
      size: 'full',
      aspectMode: 'cover',
      aspectRatio: '20:13',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: messageButtonA,
      spacing: 'sm',
      paddingAll: '13px',
    },
  };

  const flex2 = {
    type: 'bubble',
    size: 'mega',
    hero: {
      type: 'image',
      url: menuGroupB_img,
      size: 'full',
      aspectMode: 'cover',
      aspectRatio: '20:13',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: messageButtonB,
      spacing: 'sm',
      paddingAll: '13px',
    },
  };

  const flex3 = {
    type: 'bubble',
    size: 'mega',
    hero: {
      type: 'image',
      url: menuGroupC_img,
      size: 'full',
      aspectMode: 'cover',
      aspectRatio: '20:13',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: messageButtonC,
      spacing: 'sm',
      paddingAll: '13px',
    },
  };

  const flex4 = {
    type: 'bubble',
    hero: {
      type: 'image',
      url: menuGroupD_img,
      size: 'full',
      aspectMode: 'cover',
      aspectRatio: '20:13',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: messageButtonD,
      spacing: 'sm',
      paddingAll: '13px',
    },
  };

  return {
    type: 'flex',
    altText: 'This is a Flex Message',
    contents: {
      type: 'carousel',
      contents: [flex1, flex2, flex3, flex4],
    },
  };
}

module.exports = HandleMessage;
