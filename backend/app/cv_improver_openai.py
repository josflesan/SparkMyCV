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
conversation.append({'role': 'system', 'content': f'Write me a CV introduction for the role {role} for {company} making sure my values align with this company.'})

response = chatGPT_conversation(conversation)

print(response)


    # intro_prompt = f'Write me a CV introduction for the role {role} for {company} making sure my values align with this company. Make sure to use information from my cv which is {cv}'

    # intro = openai.
    # intro = co.generate(  
    #     model = 'command-xlarge-nightly',
    #     max_tokens = 300,
    #     temperature = 0.7,
    #     prompt = intro_prompt)

    # skills_prompt = f'Get me some skills for the role {role} for {company} and add relevant skills from my cv which is {cv}. Make sure the layout is bullet points for each skill.'

    # skills = co.generate(
    #     model = 'command-xlarge-nightly',
    #     max_tokens = 30,
    #     temperature = 0.7,
    #     prompt = skills_prompt)

    # experience_prompt = f'Add relevant experience from my cv which is {cv} for the role {role} and for the company {company}. Make sure the layout is bullet points for each experience with the start and end date.'

    # experience = co.generate(
    #     model = 'command-xlarge-nightly',
    #     max_tokens = 300,
    #     temperature = 0.7,
    #     prompt = experience_prompt)

    # education_prompt = f'Add relevant education from my cv which is {cv} for the role {role} and for the company {company}. Make sure the layout is bullet points for each education with the start and end date.'

    # education = co.generate(
    #     model = 'command-xlarge-nightly',
    #     max_tokens = 300,
    #     temperature = 0.7,
    #     prompt = education_prompt)
    
    # total = f'Introduction\n{intro.generations[0].text}\n\nSkills\n{skills.generations[0].text}\n\nExperience\n{experience.generations[0].text}\n\nEducation\n{education.generations[0].text}'


    # # Write new cv to file.
    # with open('newcv.txt', 'w') as f:
    #     f.write(total)

# if __name__ == '__main__':
#     main()