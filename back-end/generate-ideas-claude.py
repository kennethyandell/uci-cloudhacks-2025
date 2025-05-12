import json
import boto3
import botocore
import time



def invoke_claude(whiteboard: str, prompt: str):
    session = boto3.session.Session()
    region = session.region_name
    bedrock = boto3.client('bedrock-runtime', region)
    model_id = "anthropic.claude-3-5-haiku-20241022-v1:0"


    if prompt:
        user_prompt_inside_system = f"In your thinking, consider this input prompt, which is a prompt from the user to guide to generate new ideas: \"{prompt}\""
    else:
        user_prompt_inside_system = ""

    system_prompt = f"""
    You will be given SVG code that represents a whiteboard with sticky notes that are represented as embedded SVGs. The text inside the "data-text" field and in between the <text> tag is an idea that the user has inputted. Your job is to evaluate all the ideas that the user inputted previously and create new ideas as multiple sticky notes.

    {prompt}

The sticky notes that you make need to be in this SVG format ("NOTEHERE" is the placeholder for the note's text will be)
<svg class="sticky-note" x="324" y="118" width="150" height="150" style="pointer-events: all;" data-text="NOTEHERE,"><rect width="150" height="150" stroke="#9EB1FF" fill="#E0E6FF"></rect><text x="10" y="20" font-size="16" fill="#000"><tspan x="10" dy="16">NOTEHERE,</tspan></text></svg>

The sticky notes need to be emebbed inside the whiteboard SVG code. You must output the whiteboard SVG code as plaintext and nothing else. Do not change anything else, including the trash can icon. 
    """

    claude_body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1000,
        "temperature": 0.5,
        "top_p": 0.9,
        "system": system_prompt,
        "messages": [{
            "role": "user",
            "content": [{"type": "text", "text": whiteboard}]
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
    prompt = json.loads(event['body'])['prompt']

    output_whiteboard = invoke_claude(whiteboard, prompt)

    return {
        'statusCode': 200,
        'body': json.dumps(f'{output_whiteboard}')
    }
