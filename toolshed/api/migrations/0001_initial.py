# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0006_require_contenttypes_0002'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GroupExtension',
            fields=[
                ('group', models.OneToOneField(primary_key=True, serialize=False, to='auth.Group')),
                ('description', models.TextField()),
                ('website', models.TextField()),
                ('gpg_pubkey_id', models.CharField(max_length=16)),
            ],
        ),
        migrations.CreateModel(
            name='Installable',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=120)),
                ('synopsis', models.TextField()),
                ('description', models.TextField()),
                ('remote_repository_url', models.TextField()),
                ('homepage_url', models.TextField()),
                ('repository_type', models.IntegerField(choices=[(0, b'package'), (1, b'tool'), (2, b'datatype'), (3, b'suite'), (4, b'viz'), (5, b'gie')])),
                ('group_access', models.ManyToManyField(to='auth.Group', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Revision',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('version', models.CharField(max_length=12)),
                ('commit_message', models.TextField()),
                ('public', models.BooleanField(default=True)),
                ('uploaded', models.DateTimeField()),
                ('tar_gz_sha256', models.CharField(max_length=64)),
                ('tar_gz_sig_available', models.BooleanField(default=False)),
                ('downloads', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='RevisionDependency',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('from_revision', models.ForeignKey(related_name='from_revision', to='api.Revision')),
                ('to_revision', models.ForeignKey(related_name='to_revision', to='api.Revision')),
            ],
        ),
        migrations.CreateModel(
            name='SuiteRevision',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('version', models.CharField(max_length=12)),
                ('commit_message', models.TextField()),
                ('contained_revisions', models.ManyToManyField(to='api.Revision')),
                ('installable', models.ForeignKey(to='api.Installable')),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('display_name', models.CharField(max_length=120)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='UserExtension',
            fields=[
                ('user', models.OneToOneField(primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('api_key', models.CharField(unique=True, max_length=32)),
                ('gpg_pubkey_id', models.CharField(max_length=16)),
            ],
        ),
        migrations.AddField(
            model_name='revision',
            name='dependencies',
            field=models.ManyToManyField(related_name='used_in', through='api.RevisionDependency', to='api.Revision', blank=True),
        ),
        migrations.AddField(
            model_name='revision',
            name='installable',
            field=models.ForeignKey(to='api.Installable'),
        ),
        migrations.AddField(
            model_name='revision',
            name='replacement_revision',
            field=models.ForeignKey(blank=True, to='api.Revision', null=True),
        ),
        migrations.AddField(
            model_name='installable',
            name='tags',
            field=models.ManyToManyField(to='api.Tag'),
        ),
        migrations.AddField(
            model_name='installable',
            name='user_access',
            field=models.ManyToManyField(to=settings.AUTH_USER_MODEL, blank=True),
        ),
    ]
