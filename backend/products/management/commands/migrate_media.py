from django.core.management.base import BaseCommand
from products.models import ProductImages

class Command(BaseCommand):
    help = "Force migrate remaining local media files to Cloudinary"

    def handle(self, *args, **kwargs):
        qs = ProductImages.objects.exclude(images__startswith="http")

        if not qs.exists():
            self.stdout.write(self.style.SUCCESS("No local images left to migrate"))
            return

        for img in qs:
            if img.images and img.images.name:
                self.stdout.write(f"Force migrating: {img.images.name}")
                img.images.save(
                    img.images.name,
                    img.images.file,
                    save=True
                )

        self.stdout.write(self.style.SUCCESS("✅ Remaining images migrated"))
