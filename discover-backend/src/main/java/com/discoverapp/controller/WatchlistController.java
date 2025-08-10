package com.discoverapp.controller;

import com.discoverapp.dto.AddToWatchListRequest;
import com.discoverapp.dto.UpdateWatchListItem;
import com.discoverapp.dto.WatchlistItemDto;
import com.discoverapp.security.JwtUtil;
import com.discoverapp.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {
    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody AddToWatchListRequest request) {
        String username = jwtUtil.extractUsername();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        try {
        WatchlistItemDto watchListItem = watchlistService.addWatchlistItem(username, request);
        return ResponseEntity.ok(watchListItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }

    @PostMapping("/update")
    public ResponseEntity<WatchlistItemDto> update(@RequestBody UpdateWatchListItem request) {
        String username = jwtUtil.extractUsername();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        WatchlistItemDto watchListItem = watchlistService.updateWatchLIstItem(request);
        return ResponseEntity.ok(watchListItem);
    }

    @DeleteMapping("/remove/{id}")
    public void remove(@PathVariable Long id) {
        watchlistService.removeWatchlistItem(id);
    }

    @GetMapping("/user")
    public ResponseEntity<List<WatchlistItemDto>> getUserWatchlist() {
        String username = jwtUtil.extractUsername();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }

        try {
            List<WatchlistItemDto> watchlist = watchlistService.getUserWatchlistByUsername(username);
            return ResponseEntity.ok(watchlist);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // Keep the old endpoint for backward compatibility
    @GetMapping("/user/{userId}")
    public List<WatchlistItemDto> list(@PathVariable Long userId) {
        return watchlistService.listWatchlistItems(userId);
    }
} 