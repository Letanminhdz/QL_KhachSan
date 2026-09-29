<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\LoaiPhong;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

$loaiPhongs = LoaiPhong::all();

foreach ($loaiPhongs as $lp) {
    echo "Processing LoaiPhong ID: " . $lp->id . "\n";
    $id = $lp->id;
    
    // Create dir if not exists
    if (!Storage::disk('public')->exists('loai_phong/' . $id)) {
        Storage::disk('public')->makeDirectory('loai_phong/' . $id);
    }
    
    // Main image
    if ($lp->hinh_anh) {
        $oldPath = str_replace('storage/', '', $lp->hinh_anh);
        if (Storage::disk('public')->exists($oldPath) && !Str::contains($oldPath, 'loai_phong/' . $id . '/anh_chinh')) {
            $ext = pathinfo($oldPath, PATHINFO_EXTENSION);
            $newPath = "loai_phong/{$id}/anh_chinh.{$ext}";
            Storage::disk('public')->move($oldPath, $newPath);
            $lp->hinh_anh = 'storage/' . $newPath;
        }
    }

    // Sub images
    if ($lp->hinh_anh_phu && is_array($lp->hinh_anh_phu)) {
        $newHinhAnhPhu = [];
        foreach ($lp->hinh_anh_phu as $phuPath) {
            $oldPath = str_replace('storage/', '', $phuPath);
            if (Storage::disk('public')->exists($oldPath) && !Str::contains($oldPath, 'loai_phong/' . $id . '/anh_phu_')) {
                $ext = pathinfo($oldPath, PATHINFO_EXTENSION);
                $uniq = uniqid();
                $newPath = "loai_phong/{$id}/anh_phu_{$uniq}.{$ext}";
                Storage::disk('public')->move($oldPath, $newPath);
                $newHinhAnhPhu[] = 'storage/' . $newPath;
            } else {
                $newHinhAnhPhu[] = $phuPath;
            }
        }
        $lp->hinh_anh_phu = $newHinhAnhPhu;
    }
    
    $lp->save();
}

echo "Done!\n";
