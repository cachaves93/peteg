from google.cloud import firestore
from pywebpush import webpush, WebPushException
from google.cloud import secretmanager
import json
import re

def get_aud(subscription_info) -> str:
    endpoint = subscription_info.get('endpoint')
    return re.match('(https:\/\/)[\w\.-]+', endpoint).group(0)


data_to_send = {
    u'notification': {
        u'title': 'Seja bem-vindo ao PETEG!',
        u'body': 'Esperamos fotos dos seus pets =)',
        u'data': {
            'onActionClick': {
                'default': {
                    u'operation': 'openWindow'
                }
            }
        }
    }
}

firestore_client = firestore.Client()
secret_manager_client = secretmanager.SecretManagerServiceClient()
vapid_private_key = secret_manager_client.access_secret_version(
    request={ u'name': 'projects/559745617298/secrets/VAPID_PRIVATE_KEY/versions/1' }
).payload.data.decode("UTF-8")
push_notifications_subscriptions = firestore_client.collection('push-subscriptions').get()

for push_notification_subscription in push_notifications_subscriptions:
    subscription_info = push_notification_subscription.to_dict().get('pushSubscription')
    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(data_to_send),
            vapid_private_key=vapid_private_key,
            vapid_claims = {
                u'sub': 'mailto:carlos.chaves@eteg.com.br',
                u'aud': get_aud(subscription_info)
            }
        )
    except WebPushException as ex:
        print('exception')
        print(ex)
