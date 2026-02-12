<!DOCTYPE html>
<html>
<head>
    <title></title>
   
</head>
<body>

<h1>Cloudinary Integration & Image Migration Architecture</h1>

<div class="section">
<h2>1. Why Cloudinary Was Introduced</h2>
<p>
Originally, all images were stored locally inside the <code>MEDIA_ROOT</code> directory.
This works during development but becomes problematic in production.
</p>

<ul>
<li>Render does not guarantee persistent local storage.</li>
<li>Images would disappear after redeployments.</li>
<li>Scaling horizontally would break local storage consistency.</li>
<li>No CDN acceleration.</li>
</ul>

<p>
To solve this permanently, Cloudinary was integrated as the media storage backend.
Cloudinary provides:
</p>

<ul>
<li>CDN-based delivery</li>
<li>Persistent storage</li>
<li>Automatic optimization</li>
<li>HTTPS secure URLs</li>
<li>Scalability</li>
</ul>
</div>

<div class="section">
<h2>2. Cloudinary Configuration</h2>

<p>Required packages:</p>

<pre>
pip install cloudinary django-cloudinary-storage
</pre>

<p>settings.py configuration:</p>

<pre>
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUD_NAME'),
    'API_KEY': os.environ.get('API_KEY'),
    'API_SECRET': os.environ.get('API_SECRET'),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
</pre>

<p>
Once configured, every new image upload automatically stores the file in Cloudinary.
</p>
</div>

<div class="section">
<h2>3. The Real Problem: Existing Images</h2>

<p>
Switching to Cloudinary does NOT automatically migrate previously uploaded images.
All previously uploaded files still existed locally and their database paths pointed to local file storage.
</p>

<p>
This required a forced re-upload strategy.
</p>
</div>

<div class="section">
<h2>4. Why a Maintenance App Was Created</h2>

<p>
Instead of writing temporary scripts or manual fixes, a dedicated Django management command was created inside a maintenance module.
</p>

<p>
This ensures:
</p>

<ul>
<li>Controlled migration process</li>
<li>Repeatable execution</li>
<li>Clear logging</li>
<li>Safe file verification</li>
<li>Database consistency</li>
</ul>

<p>
The command can be executed anytime without touching business logic.
</p>
</div>

<div class="section">
<h2>5. Custom Management Command Logic</h2>

<p>
Command name:
</p>

<pre>
python manage.py migrate_all_images_to_cloudinary
</pre>

<p>
What it does:
</p>

<ul>
<li>Iterates through ProductImages</li>
<li>Iterates through BannerImage</li>
<li>Iterates through SubCategory</li>
<li>Re-uploads each local image to Cloudinary</li>
<li>Updates database URL automatically</li>
</ul>

<p>Core migration logic:</p>

<pre>
def migrate(self, instance, field_name):
    field = getattr(instance, field_name)

    if not field:
        return "skipped"

    local_path = os.path.join(settings.MEDIA_ROOT, field.name)

    if not os.path.exists(local_path):
        self.stdout.write(self.style.ERROR(f"Missing: {local_path}"))
        return "missing"

    with open(local_path, "rb") as f:
        field.save(
            os.path.basename(local_path),
            File(f),
            save=True
        )

    return "migrated"
</pre>

<p>
This forces Django to treat the existing file as a new upload.
Cloudinary then stores it and replaces the stored path with a CDN URL.
</p>
</div>

<div class="section">
<h2>6. Humanized Migration Output</h2>

<p>
Instead of silent execution, the command tracks:
</p>

<ul>
<li>Migrated images</li>
<li>Missing files</li>
<li>Skipped records</li>
</ul>

<p>Final output example:</p>

<pre>
✔ DONE | Migrated=128 | Missing=2 | Skipped=5
</pre>

<p>
This makes the process transparent and auditable.
</p>
</div>

<div class="section">
<h2>7. Why This Approach Is Production-Safe</h2>

<ul>
<li>No manual database editing</li>
<li>No raw SQL manipulation</li>
<li>No broken foreign keys</li>
<li>No downtime required</li>
<li>Fully reversible</li>
</ul>

<p>
This is a controlled, architecture-level migration — not a quick hack.
</p>
</div>

<div class="section">
<h2>8. Final Architecture Result</h2>

<ul>
<li>Frontend (Vercel)</li>
<li>Backend (Render - Django + PostgreSQL)</li>
<li>Media Storage (Cloudinary CDN)</li>
</ul>

<p>
System is now fully production-ready and horizontally scalable.
</p>
</div>

</body>
</html>
