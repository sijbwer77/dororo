from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("group", "0002_groupfile"),
    ]

    operations = [
        migrations.AlterField(
            model_name="document",
            name="block_type",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("page", "Page"),
                    ("folder", "Folder"),
                    ("text", "Text"),
                    ("file", "File"),
                    ("toggle", "Toggle"),
                    ("divider", "Divider"),
                ],
            ),
        ),
    ]
