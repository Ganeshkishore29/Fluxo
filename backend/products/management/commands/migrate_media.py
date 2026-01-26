from django.core.management.base import BaseCommand
from products.models import ProductImages

class Command(BaseCommand):
    help = "Migrate local product images to Cloudinary"

    def handle(self, *args, **kwargs):
        images_qs = ProductImages.objects.all()

        if not images_qs.exists():
            self.stdout.write(self.style.WARNING("No images found to migrate"))
            return

        for img in images_qs:
            if img.images:
                self.stdout.write(f"Migrating: {img.images.name}")

                # Re-save the image -> triggers upload to Cloudinary
                img.images.save(
                    img.images.name,
                    img.images.file,
                    save=True
                )

        self.stdout.write(self.style.SUCCESS(" All product images migrated to Cloudinary"))
