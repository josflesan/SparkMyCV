import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def chatGPT_conversation(conversation):

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation
    )

    return response

role = input('Enter your role: ')
company = input('Enter the company name: ')

conversation = []
conversation.append({'role': 'system', 
                     'content': f'Write me a CV introduction for the role {role} for {company} making sure my values align with this company.'})

response = chatGPT_conversation(conversation)

print(response["choices"][0]["message"]["content"])