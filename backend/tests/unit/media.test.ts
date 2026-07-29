import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import MediaService from '../../src/modules/media/media.service.js';
import MediaRepository from '../../src/modules/media/media.repository.js';
import { MediaType } from '../../src/generated/prisma/index.js';

describe('Phase 10 — Media Library Unit Tests', () => {
  it('should retrieve media list with pagination', async () => {
    const res = await MediaService.getMedia({ page: 1, limit: 10 });
    assert.equal(res.page, 1);
    assert.equal(res.limit, 10);
    assert.ok(Array.isArray(res.items));
  });

  it('should update media metadata', async () => {
    const time = Date.now();
    const media = await MediaRepository.createMedia({
      originalName: `test_${time}.png`,
      fileName: `test_${time}.png`,
      storageKey: `test_${time}.png`,
      url: `/uploads/test_${time}.png`,
      thumbnailUrl: `/uploads/thumbnails/thumb_test_${time}.webp`,
      mimeType: 'image/png',
      fileSize: 1024,
      width: 100,
      height: 100,
      mediaType: MediaType.IMAGE,
    });

    const updated = await MediaService.updateMedia(media.id, {
      title: 'Updated Title',
      altText: 'Updated Alt',
    });

    assert.equal(updated.title, 'Updated Title');
    assert.equal(updated.altText, 'Updated Alt');

    // Clean up
    await MediaRepository.deleteMedia(media.id);
  });

  it('should prevent deleting attached media with 409 Conflict', async () => {
    // Find media attached to brand or product
    const allMedia = await MediaRepository.findManyPaginated({ page: 1, limit: 100 });
    let attachedMediaId: string | null = null;

    for (const item of allMedia.items) {
      const usage = await MediaRepository.countUsage(item.id);
      if (usage > 0) {
        attachedMediaId = item.id;
        break;
      }
    }

    if (attachedMediaId) {
      await assert.rejects(
        async () => {
          await MediaService.deleteMedia(attachedMediaId!);
        },
        (err: any) => {
          assert.equal(err.statusCode, 409);
          assert.match(err.message, /attached/i);
          return true;
        },
      );
    }
  });
});
