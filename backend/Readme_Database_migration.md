<!DOCTYPE html>
<html>
<head>
    
</head>
<body>

<h1>Database Migration Guide</h1>
<h2>MySQL (Railway) → PostgreSQL (Render)</h2>

<hr>

<h2>Overview</h2>
<p>
This document explains the complete process of migrating the backend database
from MySQL (Railway hosting) to PostgreSQL (Render hosting).
</p>

<p>
The goal of this migration was:
</p>

<ul>
    <li>Move away from Railway free-tier limitations</li>
    <li>Use PostgreSQL (better production compatibility)</li>
    <li>Deploy backend fully on Render infrastructure</li>
</ul>

<hr>

<h2>Step 1 – Reconnect to Source MySQL Database</h2>

<p>
Before migration, Django was temporarily reconnected to the original MySQL database.
</p>

<pre>
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'railway',
        'USER': 'root',
        'PASSWORD': 'YOUR_PASSWORD',
        'HOST': 'YOUR_HOST',
        'PORT': 'YOUR_PORT',
    }
}
</pre>

<p>
Verification was done using:
</p>

<pre>
python manage.py shell
</pre>

<pre>
from django.contrib.auth import get_user_model
get_user_model().objects.count()
</pre>

<p>
If correct user count appeared, the connection was confirmed.
</p>

<hr>

<h2>Step 2 – Dumping MySQL Data</h2>

<p>
A clean JSON dump was created excluding system tables:
</p>

<pre>
python manage.py dumpdata --exclude contenttypes --exclude auth.permission --exclude admin.logentry --indent 2 --output=data.json
</pre>

<p>
Important considerations:
</p>

<ul>
    <li>No usage of <code>&gt;</code> redirection (to prevent encoding issues)</li>
    <li>Ensured file encoding was UTF-8</li>
    <li>Verified file size was not empty</li>
</ul>

<hr>

<h2>Step 3 – Setup PostgreSQL on Render</h2>

<p>
A new PostgreSQL database was created in Render dashboard.
</p>

<p>
The External DATABASE_URL was copied:
</p>

<pre>
postgresql://user:password@host:5432/dbname
</pre>

<p>
Configured in Django:
</p>

<pre>
import os
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(default=os.environ.get("DATABASE_URL"))
}
</pre>

<hr>

<h2>Step 4 – Apply Migrations on PostgreSQL</h2>

<pre>
python manage.py migrate
</pre>

<p>
This created all required tables in PostgreSQL before loading data.
</p>

<hr>

<h2>Step 5 – Load Data into PostgreSQL</h2>

<pre>
python manage.py loaddata data.json
</pre>

<p>
Expected output:
</p>

<pre>
Installed XXXX object(s) from 1 fixture(s)
</pre>

<p>
Final verification:
</p>

<pre>
python manage.py shell
</pre>

<pre>
from django.contrib.auth import get_user_model
get_user_model().objects.count()
</pre>

<hr>

<h2>Deployment Configuration on Render</h2>

<p><strong>Build Command:</strong></p>
<pre>pip install -r requirements.txt && python manage.py collectstatic --noinput</pre>

<p><strong>Start Command:</strong></p>
<pre>gunicorn backend.wsgi:application</pre>

<hr>

<h2>Common Issues Faced During Migration</h2>

<ul>
    <li><strong>UnicodeDecodeError</strong> → Resolved by saving JSON as UTF-8</li>
    <li><strong>Foreign key violations</strong> → Resolved by excluding admin.logentry</li>
    <li><strong>Wrong database connection</strong> → Verified via connection.settings_dict</li>
</ul>

<hr>

<h2>Migration Status</h2>

<p>
✔ MySQL successfully migrated to PostgreSQL<br>
✔ Backend fully deployed on Render<br>
✔ Production database verified and working
</p>

</body>
</html>
