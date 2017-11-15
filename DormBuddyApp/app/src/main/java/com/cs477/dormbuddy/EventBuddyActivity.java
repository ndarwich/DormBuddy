package com.cs477.dormbuddy;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;

public class EventBuddyActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_event_buddy);
    }

    public void createEventClicked(View view) {
        Intent intent = new Intent(this, CreateEventActivity.class);
        startActivity(intent);
    }
}
