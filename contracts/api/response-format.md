# beFootball API Response Contract

ทุก endpoint ของ Yii2 API ต้องคืนรูปแบบเดียวกัน

## Success

```json
{
  "status": "success",
  "data": {},
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 120
  },
  "error_msg": null
}
```

## Fail

```json
{
  "status": "fail",
  "data": null,
  "pagination": null,
  "error_msg": "ข้อความ error"
}
```

## Public Endpoints

- `GET /api/news`
- `GET /api/news/{slug}`
- `GET /api/news/latest`
- `GET /api/news/trending`
- `GET /api/rumors`
- `GET /api/rumors/{slug}`
- `GET /api/rumors/latest`
- `GET /api/rumors/trending`
- `GET /api/teams/{slug}/news`
- `GET /api/players/{slug}/rumors`
- `GET /api/leagues/{slug}/standings`
- `GET /api/fixtures/today`
- `GET /api/results/today`
- `GET /api/standings/{league}`

## Admin Endpoints

- `POST /api/admin/articles/{id}/approve`
- `POST /api/admin/articles/{id}/reject`
- `POST /api/admin/articles/{id}/refresh-translation`
- `POST /api/admin/rumors/{id}/approve`
- `POST /api/admin/rumors/{id}/reject`
- `POST /api/admin/rumors/{id}/mark-confirmed`
- `POST /api/admin/rumors/{id}/mark-denied`
- `POST /api/admin/rumors/{id}/mark-fake`
- `POST /api/admin/rumors/{id}/merge`
- `POST /api/admin/rumors/{id}/recalculate-score`
- `POST /api/admin/rumors/{id}/refresh-translation`
