from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from products.models import Product
from .ai_utils import send_to_ai


class ChatAPIView(APIView):
    """
    Chatbot API using Groq LLM for intent detection and
    context-aware product search.
    """

    ALLOWED_SUBCATEGORIES = [
        "t-shirt", "shirt", "trousers", "jackets",
        "coats", "tops", "leggings", "blouses", "skirts"
    ]

    def post(self, request):
        message = request.data.get("message", "").strip()
        session = request.session

        ai = send_to_ai(message)
        intent = ai.get("intent")
        payload = ai.get("payload", {})

        # Load previous search context
        last_context = session.get("last_search", {})

        # PRICE-ONLY MESSAGE → reuse last subcategory
        if payload.get("max_price") and not payload.get("subcategory"):
            payload["category"] = payload.get("category") or last_context.get("category")
            payload["subcategory"] = last_context.get("subcategory")

        # Save context for next message
        if intent == "search":
            session["last_search"] = {
                "category": payload.get("category"),
                "subcategory": payload.get("subcategory"),
            }

        if intent == "search":
            return self.perform_search(payload, ai.get("reply", ""))

        return Response({
            "type": "text",
            "data": ai.get("reply", "Sorry, I didn't understand.")
        })

    def perform_search(self, payload, reply_text):
        """
        Filter products based on AI-extracted payload + conversation context
        """
        category = payload.get("category")
        subcategory = payload.get("subcategory")
        max_price = payload.get("max_price")
        query = payload.get("query")

       
        if subcategory and subcategory not in self.ALLOWED_SUBCATEGORIES:
            subcategory = None

        qs = Product.objects.all()

        if category:
            qs = qs.filter(
                sub_category__main_category__name__icontains=category
            )

        if subcategory:
            qs = qs.filter(
                sub_category__name__icontains=subcategory
            )

        if max_price:
            qs = qs.filter(price__lte=max_price)

        if query:
            qs = qs.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(sub_category__name__icontains=query)
            )

      
        if not qs.exists():
            msg = "Sorry, we don’t have "

            if subcategory:
                msg += f"{subcategory} "
            else:
                msg += "products "

            if max_price:
                msg += f"under ₹{max_price}. "

            msg += (
                "You can try increasing your budget or explore "
                "leggings, skirts, tops, or jackets."
            )

            return Response({
                "type": "text",
                "data": msg
            })

        data = self.serialize(qs[:20])

        return Response({
            "type": "products",
            "reply": reply_text,
            "data": data
        })

    def serialize(self, products):
        """
        Convert Product queryset into JSON-friendly format
        """
        data = []
        for p in products:
            img_obj = p.images.first()
            image = img_obj.images.url if img_obj else None

            data.append({
                "id": p.id,
                "name": p.name,
                "main_category": p.sub_category.main_category.name,
                "sub_category": p.sub_category.name,
                "price": p.price,
                "image": image,
            })
        return data
