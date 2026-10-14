<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    private $filePath = 'settings.json';

    public function getSettings()
    {
        $path = database_path('json_data/' . $this->filePath);
        $settings = file_exists($path) ? json_decode(file_get_contents($path), true) : [];
        if (!is_array($settings)) {
            $settings = [];
        }
        
        // Mặc định nạp key từ .env nếu settings.json chưa có
        if (empty($settings['gemini_api_key'])) {
            $settings['gemini_api_key'] = env('GEMINI_API_KEY', '');
        }
        if (empty($settings['gemini_model'])) {
            $settings['gemini_model'] = env('GEMINI_MODEL', 'gemini-2.5-flash');
        }
        if (!isset($settings['ai_provider'])) {
            $settings['ai_provider'] = 'gemini';
        }
        if (!isset($settings['ai_enabled'])) {
            $settings['ai_enabled'] = true;
        }

        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'address'            => 'nullable|string',
            'hotline'            => 'nullable|string',
            'email'              => 'nullable|email',
            'facebook'           => 'nullable|string',
            'instagram'          => 'nullable|string',
            'youtube'            => 'nullable|string',
            'google_map'         => 'nullable|string',
            'bank_name'          => 'nullable|string',
            'bank_account'       => 'nullable|string',
            'deposit_percentage' => 'nullable|numeric|min:0|max:100',
            'ai_provider'        => 'nullable|string',
            'gemini_api_key'     => 'nullable|string',
            'gemini_model'       => 'nullable|string',
            'openai_api_key'     => 'nullable|string',
            'openai_model'       => 'nullable|string',
            'ai_enabled'         => 'nullable|boolean',
            'ai_welcome_message' => 'nullable|string',
        ]);

        $path = database_path('json_data/' . $this->filePath);
        $currentSettings = file_exists($path) ? json_decode(file_get_contents($path), true) : [];
        if (!is_array($currentSettings)) {
            $currentSettings = [];
        }

        $newSettings = array_merge($currentSettings, $validated);

        file_put_contents($path, json_encode($newSettings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return response()->json([
            'message' => 'Cập nhật cấu hình thành công',
            'data'    => $newSettings,
        ]);
    }
}