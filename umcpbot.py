import discord
import asyncio

client = discord.Client()
server = '348919724635324419'
rolerequest = '348933488746954752'
roles = []

@client.event
async def on_message(message):
    parsed = message.content.split()

    if(message.content.startswith('!addgame')):
        if(message.channel.id != rolerequest):
            await client.send_message(message.channel, 'Keep all role requests in the <#348933488746954752> channel!')
            return

        for role in roles:
            for i in range(1, len(parsed)):
                if(role.name == parsed[i] and role.name != 'Admin' and role.name != 'Bot'):
                    await client.send_message(message.channel, 'Adding ' + message.author.name + ' to ' + parsed[i] + '...')
                    await client.add_roles(message.author, role)

    if(message.content.startswith('!removegame')):
        if(message.channel.id != rolerequest):
            await client.send_message(message.channel, 'Keep all role requests in the <#348933488746954752> channel!')
            return

        for role in roles:
            for i in range(1, len(parsed)):
                if(role.name == parsed[i] and role.name != 'Admin' and role.name != 'Bot'):
                    await client.send_message(message.channel, 'Removing ' + message.author.name + ' from ' + parsed[i] + '...')
                    await client.remove_roles(message.author, role)


    elif(message.content.startswith('!help')):
        s = """ ```Markdown
!help - Displays this message
!addgame [game] <game> <game> ... - Add the game role(s) to allow access to the chat channels
!removegame [game] <game> <game> ... - Remove the game role(s)
```

        """
        await client.send_message(message.channel, s)


@client.event
async def on_ready():
    global roles, server
    server = client.get_server(server)
    roles = server.roles
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    print('------')

client.run('MzQ5NTk5MzA3MjAyMDM1NzE0.DH36AA.OpWuFqLsT35zjaeawqiv5bUJFzY')
