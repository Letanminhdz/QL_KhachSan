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
        Schema::table('dich_vu', function (Blueprint $table) {
            $table->string('loai_dich_vu', 50)->default('Khac');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dich_vu', function (Blueprint $table) {
            $table->dropColumn('loai_dich_vu');
        });
    }
};
