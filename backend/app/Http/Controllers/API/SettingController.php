<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    private $filePath = 'data/settings.json';

    public function getSettings()
    {
        $content = Storage::get($this->filePath);
        return response()->json(json_decode($content, true));
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
            'deposit_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $currentSettings = json_decode(Storage::get($this->filePath), true);

        // Merge, keeping existing values for fields not provided
        $newSettings = array_merge($currentSettings, array_filter($validated, function ($value) {
            return $value !== null;
        }));

        Storage::put($this->filePath, json_encode($newSettings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return response()->json([
            'message' => 'Cập nhật cấu hình thành công',
            'data'    => $newSettings,
        ]);
    }
}
