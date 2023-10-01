import os

x = input('Commit message: ')

os.system('git add .')
os.system(f'git commit -m "{x}"')
os.system('git push')
os.system('npm run deploy')