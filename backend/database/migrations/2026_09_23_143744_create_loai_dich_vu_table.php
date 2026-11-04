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
        Schema::create('loai_dich_vu', function (Blueprint $table) {
            $table->id();
            $table->string('ten_loai', 100);
            $table->timestamps();
        });

        Schema::table('dich_vu', function (Blueprint $table) {
            $table->dropColumn('loai_dich_vu');
            $table->foreignId('id_loai_dich_vu')->nullable()->constrained('loai_dich_vu')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dich_vu', function (Blueprint $table) {
            $table->dropForeign(['id_loai_dich_vu']);
            $table->dropColumn('id_loai_dich_vu');
            $table->string('loai_dich_vu', 50)->default('Khac');
        });
        
        Schema::dropIfExists('loai_dich_vu');
    }
};
