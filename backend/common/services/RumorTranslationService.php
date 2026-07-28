<?php

namespace common\services;

final class RumorTranslationService
{
    public function buildPrompt(array $posts): string
    {
        $payload = json_encode($posts, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        return <<<PROMPT
คุณคือผู้ช่วยสรุปข่าวลือฟุตบอลภาษาไทย

กฎ:
- ห้ามยืนยันข่าวที่ยังไม่มี official confirmation
- ใช้คำว่า "มีรายงานว่า", "ถูกเชื่อมโยง", "ยังไม่ยืนยัน"
- แยก fact, rumor, opinion, joke
- ระบุ risk_flags
- เสนอ confidence_score_suggestion 0-100
- output เป็น JSON เท่านั้น

INPUT:
{$payload}
PROMPT;
    }
}
