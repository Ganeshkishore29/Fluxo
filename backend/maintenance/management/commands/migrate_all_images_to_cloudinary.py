from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
import os

from products.models import ProductImages, SubCategory
from products.models import BannerImage


class Command(BaseCommand):
    help = "Migrate ALL images (products, banners, subcategory banners) to Cloudinary"

    def migrate_field(self, instance, field_name):
        field = getattr(instance, field_name)

        if not field:
            return "skipped"

        # Already Cloudinary
        if field.url.startswith("http"):
            return "skipped"

        local_path = os.path.join(settings.MEDIA_ROOT, field.name)

        if not os.path.exists(local_path):
            self.stdout.write(self.style.ERROR(f"Missing file: {local_path}"))
            return "missing"

        with open(local_path, "rb") as f:
            field.save(
                os.path.basename(local_path),
                File(f),
                save=True
            )

        return "migrated"

    def handle(self, *args, **kwargs):
        stats = {
            "migrated": 0,
            "skipped": 0,
            "missing": 0,
        }

        # Product images
        for img in ProductImages.objects.all():
            result = self.migrate_field(img, "images")
            stats[result] += 1

        # Banner images
        for banner in BannerImage.objects.all():
            result = self.migrate_field(banner, "image")
            stats[result] += 1

        # SubCategory banners
        for sub in SubCategory.objects.all():
            result = self.migrate_field(sub, "banner_image")
            stats[result] += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done → Migrated={stats['migrated']} | "
            f"Skipped={stats['skipped']} | "
            f"Missing={stats['missing']}"
        ))
