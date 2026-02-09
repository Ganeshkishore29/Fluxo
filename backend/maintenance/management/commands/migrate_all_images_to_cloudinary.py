
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
import os

from products.models import ProductImages, BannerImage, SubCategory

# This command will re-upload all existing images to Cloudinary and update the DB URLs accordingly.
# Usage: >>python manage.py migrate_all_images_to_cloudinary
 
class Command(BaseCommand):
    help = "FORCE re-upload ALL images to Cloudinary and fix DB URLs"

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

    def handle(self, *args, **kwargs):
        stats = {"migrated": 0, "missing": 0, "skipped": 0}

        for img in ProductImages.objects.all():
            stats[self.migrate(img, "images")] += 1

        for banner in BannerImage.objects.all():
            stats[self.migrate(banner, "image")] += 1

        for sub in SubCategory.objects.all():
            stats[self.migrate(sub, "banner_image")] += 1

        self.stdout.write(self.style.SUCCESS(
            f"✔ DONE | Migrated={stats['migrated']} | "
            f"Missing={stats['missing']} | Skipped={stats['skipped']}"
        ))
