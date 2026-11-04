<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loai_phong', function (Blueprint $table) {
            $table->json('hinh_anh_phu')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('loai_phong', function (Blueprint $table) {
            $table->dropColumn(['hinh_anh_phu']);
        });
    }
};
