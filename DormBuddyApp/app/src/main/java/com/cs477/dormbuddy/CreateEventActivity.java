package com.cs477.dormbuddy;

import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.app.TimePickerDialog;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.media.Image;
import android.net.Uri;
import android.provider.MediaStore;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TimePicker;
import android.widget.Toast;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;

public class CreateEventActivity extends AppCompatActivity implements SelectTimeSlotFragment.OnCompleteListener {

    static final int PICK_IMAGE = 1;
    static final int SELECT_TIME_SLOT_FRAGMENT = 1;
    static final String SELECT_TIME_SLOT_TAG = "SelectTimeSlot";
    private ImageButton imageButton;
    private Calendar startTime;
    private Calendar endTime;
    private EditText editText;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        FragmentManager fm = getFragmentManager();
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_event);
        imageButton =  (ImageButton)findViewById(R.id.createEventImageButton);
        imageButton.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View view) {
                BitmapDrawable drawable = (BitmapDrawable) imageButton.getDrawable();
                DisplayImageFragment displayImageFragment = DisplayImageFragment.newInstance(drawable.getBitmap());
                displayImageFragment.show(getSupportFragmentManager(),"DisplayImage");
                return true;
            }
        });
        editText = (EditText)findViewById(R.id.eventTime);
        editText.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view) {
                if(getSupportFragmentManager().findFragmentByTag(SelectTimeSlotFragment.SELECT_TIME_SLOT_TAG) == null) {
                    //TODO: SELECT TIME SLOT INSTEAD OF TIME, CREATE DIALOG FRAGMENT
                    Calendar mcurrentTime = Calendar.getInstance();
                    SelectTimeSlotFragment selectTimeSlotFragment = SelectTimeSlotFragment.newInstance(startTime,endTime);
                    selectTimeSlotFragment.show(getSupportFragmentManager(), SelectTimeSlotFragment.SELECT_TIME_SLOT_TAG);

                }
            }
        });

    }
    public void onComplete(Calendar start, Calendar end){
        startTime = start;
        endTime = end;
        if(startTime == null || endTime == null){
            editText.setText("");
        }
        else{
            SimpleDateFormat ft = new SimpleDateFormat("MMM d hh:mm aaa");
            editText.setText(ft.format(startTime.getTime())+" to "+ft.format(endTime.getTime()));
        }
    }
    public void selectImage(View v){
        Intent getIntent = new Intent(Intent.ACTION_GET_CONTENT);
        getIntent.setType("image/*");

        Intent pickIntent = new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        pickIntent.setType("image/*");

        Intent chooserIntent = Intent.createChooser(getIntent, "Select Image");
        chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[] {pickIntent});

        startActivityForResult(chooserIntent, PICK_IMAGE);
    }
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data)
    {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_IMAGE && resultCode == RESULT_OK) {
            try {
                final Uri imageUri = data.getData();
                final InputStream imageStream = getContentResolver().openInputStream(imageUri);
                final Bitmap selectedImage = BitmapFactory.decodeStream(imageStream);
                imageButton.setImageBitmap(selectedImage);
            } catch (FileNotFoundException e) {
                e.printStackTrace();
                Toast.makeText(CreateEventActivity.this, "Something went wrong", Toast.LENGTH_LONG).show();
            }
        }
    }
}
