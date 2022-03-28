package com.everythingandnothingdev.webbrowsermediaremotecontrol;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.gustavosanjose.sendintentplugin.SendIntent;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(SendIntent.class);
    }
}
