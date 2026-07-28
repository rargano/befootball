<?php

namespace api\serializers;

final class ApiResponse
{
    public static function success(mixed $data, ?array $pagination = null): array
    {
        return [
            'status' => 'success',
            'data' => $data,
            'pagination' => $pagination,
            'error_msg' => null,
        ];
    }

    public static function fail(string $message): array
    {
        return [
            'status' => 'fail',
            'data' => null,
            'pagination' => null,
            'error_msg' => $message,
        ];
    }
}
