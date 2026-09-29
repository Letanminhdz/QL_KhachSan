<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('su_dung_dich_vu', function (Blueprint $table) {
            $table->string('trang_thai', 50)->default('Cho_Phuc_Vu')->after('tong_tien');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('su_dung_dich_vu', function (Blueprint $table) {
            $table->dropColumn('trang_thai');
        });
    }
};
