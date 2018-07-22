import discord
import os
from discord.ext import commands
import redis
import psycopg2
import datetime
import celery
import requests

bot = commands.Bot(command_prefix="!")
token = os.environ.get("discToken")

app = celery.Celery('umcpbot', broker=os.environ.get("REDIS_URL"))

@app.task
def remind(message):
    print(" UMCP BOT Success")
    q = requests.post(os.environ.get("WEBHOOK_URL"),data={'content':message},headers={'Content-Type':'application/json'})
    print(q.json())

@bot.command()
async def ping(ctx):
    remind.delay("fuck you")

if __name__ == '__main__':
    bot.run(token)
#TODO admin add/remove games from db (@bot.check(isAdmin))
#TODO celery support for remindme feature