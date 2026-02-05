from django.core.management.base import BaseCommand
from products.models import ProductImages
from django.core.files import File
from django.conf import settings
import os

class Command(BaseCommand):
    help = "Migrate ProductImages to Cloudinary"

    def handle(self, *args, **kwargs):
        migrated = 0
        missing = 0

        for img in ProductImages.objects.all():

            if not img.images:
                continue

            # Skip already migrated
            if img.images.url.startswith("http"):
                continue

            relative_path = str(img.images)  # products_img/filename
            local_path = os.path.join(settings.MEDIA_ROOT, relative_path)

            if not os.path.exists(local_path):
                self.stdout.write(self.style.ERROR(
                    f"Missing file: {local_path}"
                ))
                missing += 1
                continue

            with open(local_path, "rb") as f:
                img.images.save(
                    os.path.basename(local_path),
                    File(f),
                    save=True
                )

            migrated += 1
            self.stdout.write(self.style.SUCCESS(
                f"Migrated image ID {img.id}"
            ))

        self.stdout.write(self.style.SUCCESS(
            f"Done → Migrated={migrated}, Missing={missing}"
        ))
