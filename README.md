# ⭐ Points Bot

A Discord bot that tracks **user points** anywhere — in servers, DMs, or group chats. Moderators can give or remove points, and the owner can manage who is a mod.

---

## ⚙️ Features

* 📊 **Check Points** – See your points or someone else’s
* ➕ **Add Points** – Mods can give points to users
* ➖ **Remove Points** – Mods can take points from users
* 🗑️ **Clear Points** – Reset all points for a user
* 👮 **Manage Mods** – Owner can add or remove moderators
* 🌍 **Works Anywhere** – Commands work in servers, DMs, or group chats

---

## 🛠️ Setup

1. Clone the bot:

```bash
git clone https://github.com/xyn4xdev-lab/pointbot.git
cd points-bot
npm install
```

2. Add your bot info in the code:

```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
OWNER_ID=your_discord_id_here
```

---

## 🚀 Commands

| Command         | What it does       | Who can use it |
| --------------- | ------------------ | -------------- |
| `/points`       | Check points       | Everyone       |
| `/addpoints`    | Give points        | Mods           |
| `/removepoints` | Take points        | Mods           |
| `/clearpoints`  | Reset points       | Mods           |
| `/addmod`       | Make someone a mod | Owner only     |
| `/removemod`    | Remove mod         | Owner only     |

---

## ⚠️ Notes

* Works in **servers, DMs, and group chats**.
