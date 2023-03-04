import cohere
import openai
import sys
import bs4

api_key = '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'

# Get cvtext.txt as a string.
def getCvText(file):
    data = open(file, 'r').read()
    return data

# Get keywords from cvtext.txt.
def getKeywords(data):
    keywords = cohere.keywords(data)
    return keywords

# Get summary from cvtext.txt
def getSummary(data):
    summary = cohere.summary(data)
    return summary

# Generate new cv.
def generateNewCv(data, keywords, summary):
    newCv = cohere.generate(data, keywords, summary)
    return newCv

# Applies the above functions to the cvtext.txt file.
def main():
    co = cohere.Client(api_key)
    role = input('Enter your role: ')
    company = input('Enter the company name: ')
    cv = getCvText('cvtext.txt')

    intro_prompt = f'Write me a CV introduction for the role {role} for {company} making sure my values align with this company. Make sure to use information from my cv which is {cv}'

    intro = co.generate(  
        model = 'command-xlarge-nightly',
        max_tokens = 300,
        temperature = 0.7,
        prompt = intro_prompt)

    skills_prompt = f'Get me some skills for the role {role} for {company} and add relevant skills from my cv which is {cv}. Make sure the layout is bullet points for each skill.'

    skills = co.generate(
        model = 'command-xlarge-nightly',
        max_tokens = 30,
        temperature = 0.7,
        prompt = skills_prompt)

    experience_prompt = f'Add relevant experience from my cv which is {cv} for the role {role} and for the company {company}. Make sure the layout is bullet points for each experience with the start and end date.'

    experience = co.generate(
        model = 'command-xlarge-nightly',
        max_tokens = 300,
        temperature = 0.7,
        prompt = experience_prompt)

    education_prompt = f'Add relevant education from my cv which is {cv} for the role {role} and for the company {company}. Make sure the layout is bullet points for each education with the start and end date.'

    education = co.generate(
        model = 'command-xlarge-nightly',
        max_tokens = 300,
        temperature = 0.7,
        prompt = education_prompt)
    
    total = f'Introduction\n{intro.generations[0].text}\n\nSkills\n{skills.generations[0].text}\n\nExperience\n{experience.generations[0].text}\n\nEducation\n{education.generations[0].text}'


    # Write new cv to file.
    with open('newcv.txt', 'w') as f:
        f.write(total)

if __name__ == '__main__':
    main()