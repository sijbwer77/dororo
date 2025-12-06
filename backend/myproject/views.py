# myproject/views.py
from django.http import FileResponse, Http404
from django.conf import settings
import os

def serve_course_message_file(request, path):
    file_path = os.path.join(settings.BASE_DIR, "course_messages", path)
    if not os.path.exists(file_path):
        raise Http404("File not found")

    # FileResponse는 자동으로 Content-Disposition 헤더를 붙여줘서
    # 브라우저가 '저장'으로 처리함
    response = FileResponse(open(file_path, "rb"))
    response["Content-Disposition"] = f'attachment; filename="{os.path.basename(file_path)}"'
    return response
