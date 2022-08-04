/* For reference:
https://github.com/DaggieBlanqx/whatsappcloudapi_wrapper
https://blog.logrocket.com/build-ecommerce-app-whatsapp-cloud-api-node-js/ */

const axios = require("axios");
const unirest = require("unirest");
const fs = require("fs");
const messageParser = require("../utils/whatsapp.messageparser.util");
class WhatsappCloud {
  constructor({
    accessToken,
    graphAPIVersion,
    senderPhoneNumberId,
    WABA_ID,
  }) {
    this.accessToken = accessToken;
    this.graphAPIVersion = graphAPIVersion || 'v13.0';
    this.senderPhoneNumberId = senderPhoneNumberId;
    this.baseUrl = `https://graph.facebook.com/${this.graphAPIVersion}`;
    this.WABA_ID = WABA_ID;

    if (!this.accessToken) {
      throw new Error('Missing "accessToken"');
    }

    if (!this.senderPhoneNumberId) {
      throw new Error('Missing "senderPhoneNumberId".');
    }

    if (graphAPIVersion) {
      console.warn(
        `Please note, the default "graphAPIVersion" is v13.0. You are using ${graphAPIVersion}. This may result in quirky behavior.`
      );
    }

    this._fetchAssistant = ({ baseUrl, url, method, headers, body }) => {
      return new Promise((resolve, reject) => {
        let defaultHeaders = () => {
          let output = {
            'Content-Type': 'application/json',
            'Accept-Language': 'en_US',
            Accept: 'application/json',
          };
          if (this.accessToken) {
            output['Authorization'] = `Bearer ${this.accessToken}`;
          }
          return output;
        };
        let defaultBody = {};
        let defaultMethod = 'GET';

        if (!url) {
          throw new Error('"url" is required in making a request');
        }

        if (!method) {
          console.warn(
            `WARNING: "method" is missing. The default method will default to ${defaultMethod}. If this is not what you want, please specify the method.`
          );
        }

        if (!headers) {
          // console.warn(`WARNING: "headers" is missing.`);
        }

        if (method?.toUpperCase() === 'POST' && !body) {
          console.warn(
            `WARNING: "body" is missing. The default body will default to ${JSON.stringify(
              defaultBody
            )}. If this is not what you want, please specify the body.`
          );
        }

        method = method?.toUpperCase() || defaultMethod;
        headers = {
          ...defaultHeaders(),
          ...headers,
        };
        body = body || defaultBody;
        this.baseUrl = baseUrl || this.baseUrl;
        let fullUrl = `${this.baseUrl}${url}`;

        unirest(method, fullUrl)
          .headers(headers)
          .send(JSON.stringify(body))
          .end(function (res) {
            if (res.error) {
              let errorObject = () => {
                try {
                  return (
                    res.body?.error ||
                    JSON.parse(res.raw_body)
                  );
                } catch (e) {
                  return {
                    error: res.raw_body,
                  };
                }
              };
              reject({
                status: 'failed',
                ...errorObject(),
              });
            } else {
              resolve({
                status: 'success',
                data: res.body,
              });
            }
          });
      });
    };

    this._mustHaverecipientPhone = (recipientPhone) => {
      if (!recipientPhone) {
        throw new Error(
          '"recipientPhone" is required in making a request'
        );
      }
    };

    this._mustHaveMessage = (message) => {
      if (!message) {
        throw new Error('"message" is required in making a request');
      }
    };

    this._mustHaveMessageId = (messageId) => {
      if (!messageId) {
        throw new Error('"messageId" is required in making a request');
      }
    };

    this._mustHaveMediaId = (mediaId) => {
      if (!mediaId) {
        throw new Error('"mediaId" is required in making a request')
      }
    }

    this._uploadMedia = async ({ file_path }) => {
      return new Promise((resolve, reject) => {
        const mediaFile = fs.createReadStream(file_path);

        unirest(
          'POST',
          `https://graph.facebook.com/${this.graphAPIVersion}/${this.senderPhoneNumberId}/media`
        )
          .headers({
            Authorization: `Bearer ${this.accessToken}`,
          })
          .field('messaging_product', 'whatsapp')
          .attach('file', mediaFile)
          .end((res) => {
            if (res.error) {
              reject(res.error);
            } else {
              let response = JSON.parse(res.raw_body);
              resolve({
                status: 'success',
                media_id: response.id,
                file_name: file_name || null,
              });
            }
          });
      });
    };

    this._retrieveMediaUrl = async ({ media_id }) => {
      const response = await this._fetchAssistant({
        url: `/${media_id}`,
        method: 'GET',
      });

      if (response.status === 'success') {
        return response.data;
      }
      throw new Error(response.error);
    };

    this.downloadMediaViaUrl = async ({ media_url, localFilePath }) => {
      return new Promise((resolve, reject) => {
        axios({
          method: 'get',
          url: media_url,
          responseEncoding: 'binary',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }).then(response => {
          fs.writeFile(localFilePath, response.data, "binary", function (err) {
            if (err) reject({
              status: 'failed',
              error: "Error in file writing"
            });;
            resolve({
              status: 'success',
              data: "File downloaded successfully"
            });
          });
        }).catch(err => {
          reject({
            status: 'failed',
            error: err
          });
        });
      });
    };

    this.deleteMedia = async ({ media_id }) => {
      return new Promise((resolve, reject) => {
        this._mustHaveMediaId(media_id);
        axios({
          method: 'delete',
          url: `https://graph.facebook.com/v13.0/${media_id}`,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }).then(response => {
          resolve({
            status: 'success',
            data: "File deleted successfully"
          });
        }).catch(err => {
          reject({
            status: 'failed',
            error: err
          });
        })
      });
    }

    this.sendReplyTextMessage = async ({ prevMessageId, message, recipientPhone }) => {
      return new Promise((resolve, reject) => {
        this._mustHaverecipientPhone(recipientPhone);
        this._mustHaveMessage(message);
        this._mustHaveMessageId(prevMessageId);

        var data = JSON.stringify({
          "messaging_product": "whatsapp",
          "recipient_type": "individual",
          "to": recipientPhone,
          "context": {
            "message_id": prevMessageId
          },
          "type": "text",
          "text": {
            "preview_url": false,
            "body": message
          }
        });
        axios({
          method: 'post',
          url: `${this.baseUrl}/${this.senderPhoneNumberId}/messages`,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          data
        }).then(response => {
          resolve({
            status: 'success',
            data: response.data
          });
        }).catch(err => {
          reject({
            status: 'failed',
            error: err
          });
        })
      });
    }

    this.sendReplySimpleButtonMessage = async ({ prevMessageId, message, recipientPhone, listOfButtons }) => {
      return new Promise((resolve, reject) => {
        this._mustHaveMessage(message);
        this._mustHaverecipientPhone(recipientPhone);
        this._mustHaveMessageId(prevMessageId);

        let validButtons = listOfButtons
          .map((button) => {
            if (!button.title) {
              throw new Error('"title" is required in making a request.');
            }
            if (button.title.length > 20) {
              throw new Error(
                'The button title must be between 1 and 20 characters long.'
              );
            }
            if (!button.id) {
              throw new Error('"id" is required in making a request.');
            }
            if (button.id.length > 256) {
              throw new Error(
                'The button id must be between 1 and 256 characters long.'
              );
            }

            return {
              type: 'reply',
              reply: {
                title: button.title,
                id: button.id,
              },
            };
          })
          .filter(Boolean);

        if (validButtons.length === 0) {
          throw new Error('"listOfButtons" is required in making a request');
        }

        let body = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientPhone,
          context: {
            message_id: prevMessageId
          },
          interactive: {
            type: 'button',
            body: {
              text: message,
            },
            action: {
              buttons: validButtons,
            },
          }
        };

        axios({
          method: 'post',
          url: `${this.baseUrl}/${this.senderPhoneNumberId}/messages`,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          data: body
        }).then(response => {
          resolve({
            status: 'success',
            data: response.data
          });
        }).catch(err => {
          reject({
            status: 'failed',
            error: err
          });
        })
      });
    }
  }

  async sendText({ message, recipientPhone }) {
    this._mustHaverecipientPhone(recipientPhone);
    this._mustHaveMessage(message);
    let body = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    };

    let response = await this._fetchAssistant({
      url: `/${this.senderPhoneNumberId}/messages`,
      method: 'POST',
      body,
    });

    return response;
  }

  async markMessageAsRead({ message_id }) {
    try {
      this._mustHaveMessageId(message_id);
      let response = await this._fetchAssistant({
        url: `/${this.senderPhoneNumberId}/messages`  ,
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id,
        },
      });

      return response;
    } catch (error) {
      let msg = error?.error_data?.details;
      if (msg && msg.includes('last-seen message in this conversation')) {
        //ignore error anyway: If message is already read or has already been deleted - since whatever the error it is non-retryable.
        return {
          status: 'success',
          data: { success: false, error: msg },
        };
      } else {
        return {
          status: 'failed',
          error,
        };
      }
    }
  }

  async sendSimpleButtons({ recipientPhone, message, listOfButtons }) {
    this._mustHaveMessage(message);
    this._mustHaverecipientPhone(recipientPhone);
    let validButtons = listOfButtons
      .map((button) => {
        if (!button.title) {
          throw new Error('"title" is required in making a request.');
        }
        if (button.title.length > 20) {
          throw new Error(
            'The button title must be between 1 and 20 characters long.'
          );
        }
        if (!button.id) {
          throw new Error('"id" is required in making a request.');
        }
        if (button.id.length > 256) {
          throw new Error(
            'The button id must be between 1 and 256 characters long.'
          );
        }

        return {
          type: 'reply',
          reply: {
            title: button.title,
            id: button.id,
          },
        };
      })
      .filter(Boolean);

    if (validButtons.length === 0) {
      throw new Error('"listOfButtons" is required in making a request');
    }

    let body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: message,
        },
        action: {
          buttons: validButtons,
        },
      },
    };

    let response = await this._fetchAssistant({
      url: `/${this.senderPhoneNumberId}/messages`,
      method: 'POST',
      body,
    });

    return response;
  }

  async sendRadioButtons({
    recipientPhone,
    headerText,
    bodyText,
    footerText,
    listOfSections,
  }) {
    this._mustHaverecipientPhone(recipientPhone);

    if (!bodyText)
      throw new Error('"bodyText" is required in making a request');
    if (!headerText)
      throw new Error('"headerText" is required in making a request');
    if (!footerText)
      throw new Error('"footerText" is required in making a request');

    let totalNumberOfItems = 0;
    let validSections = listOfSections
      .map((section) => {
        let title = section.title;
        let rows = section.rows?.map((row) => {
          if (!row.id) {
            throw new Error(
              '"row.id" of an item is required in list of radio buttons.'
            );
          }
          if (row.id.length > 200) {
            throw new Error(
              'The row id must be between 1 and 200 characters long.'
            );
          }
          if (!row.title) {
            throw new Error(
              '"row.title" of an item is required in list of radio buttons.'
            );
          }
          if (row.title.length > 24) {
            throw new Error(
              'The row title must be between 1 and 24 characters long.'
            );
          }
          if (!row.description) {
            throw new Error(
              '"row.description" of an item is required in list of radio buttons.'
            );
          }
          if (row.description.length > 72) {
            throw new Error(
              'The row description must be between 1 and 72 characters long.'
            );
          }

          totalNumberOfItems += 1;

          return {
            id: row.id,
            title: row.title,
            description: row.description,
          };
        });
        if (!title) {
          throw new Error(
            '"title" of a section is required in list of radio buttons.'
          );
        }
        return {
          title,
          rows,
        };
      })
      .filter(Boolean);

    if (totalNumberOfItems > 10) {
      throw new Error(
        'The total number of items in the rows must be equal or less than 10.'
      );
    }

    let samples = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: headerText,
        },
        body: {
          text: bodyText,
        },
        footer: {
          text: footerText,
        },
        action: {
          button: 'Select a product',
          sections: validSections,
        },
      },
    };

    if (validSections.length === 0) {
      throw new Error('"listOfSections" is required in making a request');
    }

    let response = await this._fetchAssistant({
      url: `/${this.senderPhoneNumberId}/messages`,
      method: 'POST',
      body: samples,
    });

    return response;
  }

  parseMessage(requestBody) {
    return messageParser({ requestBody, currentWABA_ID: this.WABA_ID });
  }
}

const whatsapp = new WhatsappCloud({
  accessToken: process.env.META_WA_ACCESS_TOKEN,
  senderPhoneNumberId: process.env.META_WA_SENDER_PHONENUMBER_ID,
  WABA_ID: process.env.META_WA_WABAID,
});

module.exports = whatsapp;