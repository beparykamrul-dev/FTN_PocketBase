#!/bin/bash

# ১. সিস্টেম আপডেট এবং প্রয়োজনীয় প্যাকেজ ইন্সটল
echo "Updating system and installing dependencies..."
sudo apt update && sudo apt install -y unzip curl git nginx certbot python3-certbot-nginx

# ২. প্রজেক্ট ডিরেক্টরি তৈরি
echo "Creating project directories..."
mkdir -p ~/FTN_PocketBase/pb_public
cd ~/FTN_PocketBase

# ৩. পকেটবেস ডাউনলোড (Linux 64-bit এর জন্য)
echo "Downloading PocketBase binary..."
if [ ! -f "pocketbase" ]; then
    curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_linux_amd64.zip -o pb.zip
    unzip pb.zip
    rm pb.zip
    chmod +x pocketbase
fi

# ৪. ওয়েব ফ্রন্টএন্ড ফাইল তৈরি (index.html)
echo "Creating web frontend files..."
cat <<EOF > ~/FTN_PocketBase/pb_public/index.html
<!DOCTYPE html>
<html>
<head>
    <title>FTN PocketBase</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-10">
    <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h1 class="text-xl font-bold mb-4">Upload Note</h1>
        <input id="title" type="text" placeholder="Note Title" class="w-full border p-2 mb-2">
        <input id="file" type="file" class="w-full border p-2 mb-4">
        <button onclick="upload()" class="w-full bg-blue-600 text-white p-2 rounded">Upload</button>
        <div id="list" class="mt-6"></div>
    </div>
    <script>
        const API = "https://api.familytimenet.com/api";
        async function upload() {
            const formData = new FormData();
            formData.append('title', document.getElementById('title').value);
            formData.append('attachment', document.getElementById('file').files[0]);
            await fetch(API + '/collections/notes/records', { method: 'POST', body: formData });
            alert('Uploaded!');
            load();
        }
        async function load() {
            const res = await fetch(API + '/collections/notes/records');
            const data = await res.json();
            document.getElementById('list').innerHTML = data.items.map(i => 
                \`<div class='border-b p-2'>\${i.title} - <a class='text-blue-500' href='https://api.familytimenet.com/api/files/\${i.collectionId}/\${i.id}/\${i.attachment}'>Download</a></div>\`
            ).join('');
        }
        load();
    </script>
</body>
</html>
EOF

# ৫. Nginx কনফিগারেশন তৈরি (api এবং pocketbase সাবডোমেনের জন্য)
echo "Configuring Nginx..."
sudo cat <<EOF > /etc/nginx/sites-available/ftn_pocketbase
server {
    listen 80;
    server_name api.familytimenet.com pocketbase.familytimenet.com;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Nginx একটিভেট করা
sudo ln -sf /etc/nginx/sites-available/ftn_pocketbase /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# ৬. SSL সেটআপ (Certbot)
echo "Installing SSL Certificates..."
sudo certbot --nginx -d api.familytimenet.com -d pocketbase.familytimenet.com --non-interactive --agree-tos -m admin@familytimenet.com

# ৭. PocketBase কে ব্যাকগ্রাউন্ডে চালানোর জন্য Systemd সার্ভিস তৈরি
echo "Creating Systemd Service..."
sudo cat <<EOF > /etc/systemd/system/pocketbase.service
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=$(whoami)
Group=$(whoami)
WorkingDirectory=/home/$(whoami)/FTN_PocketBase
ExecStart=/home/$(whoami)/FTN_PocketBase/pocketbase serve --http="127.0.0.1:8090"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# সার্ভিস চালু করা
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase

echo "------------------------------------------------"
echo "Setup Complete!"
echo "Dashboard: https://pocketbase.familytimenet.com/_/"
echo "API Endpoint: https://api.familytimenet.com"
echo "------------------------------------------------"