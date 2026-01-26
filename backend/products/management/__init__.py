from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = "Migrate local media files to Cloudinary"

    def handle(self, *args, **kwargs):
        for product in Product.objects.all():
            if product.image:
                self.stdout.write(f"Migrating {product.image.name}")
                product.image.save(
                    product.image.name,
                    product.image.file,
                    save=True
                )

        self.stdout.write(self.style.SUCCESS("Migration completed"))
