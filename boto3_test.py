# List all subdirectories in bucket folder
# https://github.com/boto/boto3/issues/134#issuecomment-116766812
import boto3, re
s3 = boto3.client('s3')
paginator = s3.get_paginator('list_objects_v2')
for res in paginator.paginate(Bucket='com-devmoney-test',Delimiter='/',Prefix='static/devsite/img/2048/'):
    for prefix in res.get('CommonPrefixes'):
        print(re.split('/',prefix.get('Prefix'))[4])
