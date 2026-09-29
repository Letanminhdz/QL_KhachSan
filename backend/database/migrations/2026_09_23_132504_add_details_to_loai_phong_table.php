<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loai_phong', function (Blueprint $table) {
            $table->string('hinh_anh', 255)->nullable();
            $table->text('mo_ta')->nullable();
            $table->json('tien_ich')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('loai_phong', function (Blueprint $table) {
            $table->dropColumn(['hinh_anh', 'mo_ta', 'tien_ich']);
        });
    }
};
