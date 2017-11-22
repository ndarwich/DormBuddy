package com.cs477.dormbuddy;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

/**
 * Created by ndarwich on 11/17/17.
 */

//database helper that keeps user logged in and displays their preferences
public class LocalUserHelper extends SQLiteOpenHelper {
    final static private Integer VERSION = 5;
    final static String TABLE_NAME = "dormbuddy_user";
    final static String _ID = "_id";
    final static String FULL_NAME = "student_name";
    final static String LOGGED_IN = "logged_in";
    final static String BUILDING_ID = "building_id";
    final static String BUILDING_NAME = "building_name";
    final static String ROOM_NUMBER = "room_number";
    final static String ICON = "user_photo";
    final Context context;

    final private static String CREATE_CMD =
            "CREATE TABLE dormbuddy_user (" +
                    _ID + " INTEGER PRIMARY KEY, " +
                    FULL_NAME + " TEXT NOT NULL, " +
                    LOGGED_IN + " INTEGER DEFAULT 0, " +
                    BUILDING_ID + " INTEGER DEFAULT 0, " +
                    BUILDING_NAME + " TEXT NOT NULL, " +
                    ROOM_NUMBER + " TEXT NOT NULL, " +
                    ICON + " BLOB)";

    public LocalUserHelper(Context context) {
        super(context, TABLE_NAME, null, VERSION);
        this.context = context;
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(CREATE_CMD);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS dormbuddy_user");
        onCreate(db);
    }

    void deleteDatabase ( ) {
        context.deleteDatabase(TABLE_NAME);
    }
}
