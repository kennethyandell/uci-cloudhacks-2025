import json
import boto3
import botocore
import time



def invoke_claude(prompt: str, whiteboard: str, past_messages: str):
    session = boto3.session.Session()
    region = session.region_name
    bedrock = boto3.client('bedrock-runtime', region)
    model_id = "anthropic.claude-3-5-haiku-20241022-v1:0"

    print(prompt, whiteboard, past_messages)


    system_prompt = f"""
    You are a productivity/learning/lifestyle assistant whose job is to help the user with brainstorming and guiding a user with their thought process. Your answers should be succinct as if you were engaging in casual conversation.

    For conversational context, here are all the user's past messages: {past_messages}
    Do not bring up the user's previous messages.

    Additionally, if the user refers to a whiteboard, this SVG object is the whiteboard they are referring to: {whiteboard}
    The SVG object has other SVG objects embedded into it which may represent sticky notes of the user's ideas as well as header text and lines for organizational purposes.
    Sticky notes in the color of #E0E6FF are sticky notes generated by Claude.
    """

    claude_body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1000,
        "temperature": 0.5,
        "top_p": 0.9,
        "system": system_prompt,
        "messages": [{
            "role": "user",
            "content": [{"type": "text", "text": prompt}]
        }],
    })

    try:
        response = bedrock.invoke_model(
            modelId=model_id,
            body=claude_body,
            accept="application/json",
            contentType="application/json"
        )
        response_body = json.loads(response.get('body').read())
        
        # Extract and display the response text
        claude_summary = response_body["content"][0]["text"]
        return claude_summary
    
    except botocore.exceptions.ClientError as error:
        if error.response['Error']['Code'] == 'AccessDeniedException':
            print(f"\x1b[41m{error.response['Error']['Message']}\
                \nTo troubleshoot this issue please refer to the following resources.\
                \nhttps://docs.aws.amazon.com/IAM/latest/UserGuide/troubleshoot_access-denied.html\
                \nhttps://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html\x1b[0m\n")
        else:
            raise error




def lambda_handler(event, context):
    try:
        if event['requestContext']['http']['method'] == 'OPTIONS':
            return {
                'statusCode': 200
            }
    except KeyError:
        pass

    whiteboard = json.loads(event['body'])['whiteboard']
    messages = json.loads(event['body'])['past_messages']

    current_message = messages[-1]['text']

    output = invoke_claude(current_message, whiteboard, str(messages))

    return {
        'statusCode': 200,
        'body': json.dumps(f'{output}')
    }
